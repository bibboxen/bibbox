/**
 * @file
 */

var util = require('util');
var eventEmitter = require('events').EventEmitter;

/**
 * Response object.
 *
 * @param xml
 *   Raw XML message from FBS (sip2).
 * @param firstVariableName
 *   The name of the first variable.
 */
var Response = function Response(xml, firstVariableName) {
  this.xml = xml;
  this.firstVariableName = firstVariableName;

  this.error = '';

  // Parse message from XML.
  this.parseXML();

  if (!this.hasError()) {
    // Extract variables.
    this.parseVariables();

    // Parse chars before variables in message.
    this.parseEncoding();
  }
};

// Extend the object with event emitter.
util.inherits(Response, eventEmitter);

/**
 * Parse the encoded part of the response.
 */
Response.prototype.parseEncoding = function parseEncoding() {
  var self = this;

  /**
   * Inner helper function to decode the encoded string.
   *
   * @param msg
   *   The raw message form SIP2.
   * @param cutoff
   *   The posstion of the first variable.
   */
  var Decoder = function Decoder(msg, cutoff) {
    this.ptr = 0;

    this.str = msg;
    if (cutoff !== undefined) {
      this.str = msg.substr(0, msg.indexOf(cutoff));
    }

    this.consume = function consume(numberOfchars) {
      var str = this.str.substr(this.ptr, numberOfchars);
      this.ptr += numberOfchars;
      return str;
    };
  };

  var decode = new Decoder(self.message, self.firstVariableName);
  self.id = decode.consume(2);

  // Mapping array ['label', 'length', 'name']
  var mappings = [];
  switch (self.id) {
    // Check-in Response.
    case '10':
      mappings.push(['ok', 1]);
      mappings.push(['resensitize', 1]);
      mappings.push(['magneticMedia', 1]);
      mappings.push(['alert', 1]);
      mappings.push(['transactionDate', 18]);
      break;

    // Checkout Response.
    case '12':
      mappings.push(['ok', 1]);
      mappings.push(['renewalOk', 1]);
      mappings.push(['magneticMedia', 1]);
      mappings.push(['desensitize', 1]);
      break;

    // Hold Response (may have a expiration date BW).
    case '16':
      mappings.push(['ok', 1]);
      mappings.push(['available', 1]);
      mappings.push(['transactionDate', 18]);
      break;

    // Item Information Response.
    case '18':
      mappings.push(['circulationStatus', 2]);
      mappings.push(['securityMarker', 2]);
      mappings.push(['feeType', 2]);
      mappings.push(['transactionDate', 18]);
      break;

    // Patron Status Response.
    case '24':
      mappings.push(['patronStatus', 14, 'patronStatus']);
      mappings.push(['language', 3]);
      mappings.push(['transactionDate', 18]);
      break;

    // Renew Response.
    case '30':
      mappings.push(['ok', 1]);
      mappings.push(['renewalOk', 1]);
      mappings.push(['magneticMedia', 1]);
      mappings.push(['desensitize', 1]);
      mappings.push(['transactionDate', 18]);
      break;

    // End Session Response,
    case '36':
      mappings.push(['endSession', 1]);
      mappings.push(['transactionDate', 18]);
      break;

    // Fee Paid Response.
    case '38':
      mappings.push(['paymentAccepted', 1]);
      mappings.push(['transactionDate', 18]);
      break;

    // Patron Information Response (might not be decode correctly as it has
    // mixed variable and encoded data.).
    case '64':
      mappings.push(['patronStatus', 14, 'patronStatus']);
      mappings.push(['language', 3]);
      mappings.push(['transactionDate', 18]);
      mappings.push(['holdItemsCount', 4]);
      mappings.push(['overdueItemsCount', 4]);
      mappings.push(['chargedItemsCount', 4]);
      mappings.push(['fineItemsCount', 4]);
      mappings.push(['recallItemsCount', 4]);
      mappings.push(['unavailableHoldCount', 4]);
      break;

    // Renew All Response.
    case '66':
      mappings.push(['ok', 1]);
      mappings.push(['renewedCount', 1]);
      mappings.push(['unrenewedCount', 1]);
      mappings.push(['transactionDate', 18]);
      break;

    // Login Response.
    case '94':
      mappings.push(['ok', 1]);
      break;

    // ACS Status Response.
    case '98':
      mappings.push(['onlineStatus', 1]);
      mappings.push(['checkIn', 1]);
      mappings.push(['checkOut', 1]);
      mappings.push(['status update', 1]);
      mappings.push(['offline ', 1]);
      mappings.push(['timeoutPeriod', 3]);
      mappings.push(['retriesAllowed', 3]);
      mappings.push(['datetimeSync', 18]);
      mappings.push(['protocolVersion', 1]);
      break;
  }

  mappings.map(function (conf) {
    if (conf.length > 2) {
      // Parse sub-fields.
      switch (conf[2]) {
        case 'patronStatus':
          self[conf[0]] = {};
          var subDecoder = new Decoder(decode.consume(conf[1]));
          var map = [
            ['chargePrivDenied', 1],
            ['renewalPrivDenied', 1],
            ['recallPrivDenied', 1],
            ['holdPrivDenied', 1],
            ['cardReportedLost', 1],
            ['tooManyItemsCharged', 1],
            ['tooManyItemOverdue', 1],
            ['tooManyRenewals', 1],
            ['tooManyClaimsOfItemReturned', 1],
            ['tooManyItemsLost', 1],
            ['excessiveOutstandingFines', 1],
            ['excessiveOutstandingFees', 1],
            ['recallOverdue', 1],
            ['tooManyItemsBilled', 1]
          ];
          map.map(function (items) {
            self[conf[0]][items[0]] = subDecoder.consume(items[1]);
          });
          break;
      }
    }
    else {
      self[conf[0]] = decode.consume(conf[1]);
    }
  });
};

/**
 * Extract sip2 response from XML.
 */
Response.prototype.parseXML = function parseXML() {
  var res = this.xml.match(/(<response>)(.*)(<\/response>)/);
  if (res) {
    this.message = res[2];
  }
  else {
    var err = this.xml.match(/(<error>)(.*)(<\/error>)/);
    this.error = err[2];
  }
};

/**
 * Translate response variable codes to strings.
 *
 * @param code
 *   The code to translate.
 *
 * @returns {*}
 *   The translated string for the code or the cod if no translation exists.
 */
Response.prototype.variablesResponseTranslation = function variablesResponseTranslation(code) {
  var codes = {
    'AE': 'personalName',
    'AU': 'chargedItems',
    'AP': 'currentLocation',
    'AH': 'dueDate',
    'BE': 'emailAddress',
    'BW': 'expirationDate',
    'AV': 'fineItems',
    'AS': 'holdItems',
    'BD': 'homeAddress',
    'BF': 'homePhoneNumber',
    'AO': 'institutionId',
    'AB': 'itemIdentifier',
    'CF': 'holdQueueLength',
    'CH': 'itemProperties',
    'AT': 'overdueItems',
    'AA': 'patronIdentifier',
    'AD': 'patronStatus',
    'AQ': 'permanentLocation',
    'BS': 'pickupLocation',
    'AG': 'printLine',
    'BU': 'recallItems',
    'BM': 'renewedItems',
    'AF': 'screenMessage',
    'AJ': 'titleIdentifier',
    'BK': 'transactionId',
    'CD': 'unavailableHoldItems',
    'CG': 'feeIdentifier',
    'BN': 'unrenewedItems',
    'BL': 'validPatron',
    'CQ': 'validPatronPassword'
  };

  if (codes.hasOwnProperty(code)) {
    return codes[code];
  }

  return code;
};

/**
 * Extract variables from sip2 response.
 */
Response.prototype.parseVariables = function parseVariables() {
  var self = this;

  self.message.substr(self.message.indexOf(self.firstVariableName)).split('|').map(function (str) {
    if (str) {
      self[self.variablesResponseTranslation(str.substr(0, 2))] = str.substr(2);
    }
  });
};

/**
 * Check if error exists.
 *
 * @returns {boolean}
 *   TRUE on error else FALSE.
 */
Response.prototype.hasError = function hasError() {
  return this.error !== '';
};

/**
 * Get error message.
 *
 * @returns {string}
 *   The error message.
 */
Response.prototype.getError = function getError() {
  return this.error;
};

module.exports = Response;