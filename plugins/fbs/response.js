/**
 * @file
 * Handle sip2 response from FBS server.
 */

'use strict';

var util = require('util');
var eventEmitter = require('events').EventEmitter;

var debug = require('debug')('bibbox:FBS:response');

var Entities = require('html-entities').AllHtmlEntities;

/**
 * Response object.
 *
 * @param xml
 *   Raw XML message from FBS (sip2).
 * @param firstVariableName
 *   The name of the first variable.
 *   @TODO: First variable of what? Do you mean the root element of the XML, or?
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
 * Parse SIP2 data formats to timestamp.
 *
 * @param str
 * @returns {number}
 */
Response.prototype.parseDate = function parseDate(str) {
  var time = str.split('    ');
  var hours = 0;
  var minutes = 0;
  var seconds = 0;

  if (time.length === 2) {
    hours = time[1].substr(0, 2);
    minutes = time[1].substr(2, 2);
    seconds = time[1].substr(4, 2);
  }

  return new Date(time[0].substr(0, 4), (time[0].substr(4, 2)) - 1, time[0].substr(6, 2), hours, minutes, seconds, 0).getTime();
};

/**
 * Parse the encoded part of the response.
 */
Response.prototype.parseEncoding = function parseEncoding() {
  var self = this;

  // Fields that needs to get dates converted.
  var dateFields = [
    'transactionDate'
  ];

  /**
   * Inner helper function to decode the encoded string.
   *
   * @param msg
   *   The raw message form SIP2.
   * @param cutoff
   *   The position of the first variable.
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
      mappings.push(['transactionDate', 18]);
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
      mappings.push(['renewedCount', 4]);
      mappings.push(['unrenewedCount', 4]);
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
      mappings.push(['statusUpdate', 1]);
      mappings.push(['offline', 1]);
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
            var val = subDecoder.consume(items[1]);
            self[conf[0]][items[0]] = (val === 'Y');
          });
          break;
      }
    }
    else {
      // Convert dates.
      if (dateFields.indexOf(conf[0]) !== -1) {
        self[conf[0]] = self.parseDate(decode.consume(conf[1]));
      }
      else {
        self[conf[0]] = decode.consume(conf[1]);
      }
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
    if (err) {
      this.error = err[2];
    }
    else {
      // It might be a reset service error.
      err = this.xml.match(/(<errorCode>)(.*)(<\/errorCode>)/);
      if (err) {
        var id = this.xml.match(/(<correlationId>)(.*)(<\/correlationId>)/);
        this.error = err[2] + ' - ' + (id.length ? id[2] : 'Unknown correlation id');
      }
      else {
        this.error = 'Unknown error';
      }
    }
  }
};

/**
 * Translate response variable codes to strings.
 *
 * @param code
 *   The code to translate.
 *
 * @returns {*}
 *   The translated string for the code or the code if no translation exists.
 */
Response.prototype.variablesResponseTranslation = function variablesResponseTranslation(code) {
  var codes = {
    AE: 'personalName',
    AU: 'chargedItems',
    AP: 'currentLocation',
    AH: 'dueDate',
    BE: 'emailAddress',
    BW: 'expirationDate',
    AV: 'fineItems',
    AS: 'holdItems',
    BD: 'homeAddress',
    BF: 'homePhoneNumber',
    AO: 'institutionId',
    AB: 'itemIdentifier',
    CF: 'holdQueueLength',
    CH: 'itemProperties',
    AT: 'overdueItems',
    AA: 'patronIdentifier',
    AD: 'patronStatus',
    AQ: 'permanentLocation',
    BS: 'pickupLocation',
    AG: 'printLine',
    BU: 'recallItems',
    BM: 'renewedItems',
    AF: 'screenMessage',
    AJ: 'titleIdentifier',
    BK: 'transactionId',
    CD: 'unavailableHoldItems',
    CG: 'feeIdentifier',
    BN: 'unrenewedItems',
    BL: 'validPatron',
    CQ: 'validPatronPassword',
    AM: 'libraryName',
    BX: 'supportedMessages',
    BZ: 'holdItemsLimit',
    CA: 'overdueItemsLimit',
    CB: 'chargedItemsLimit',
    BH: 'currencyType',
    BV: 'feeAmount',
    CC: 'feeLimit',
    CL: 'sortBin'
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

  var entities = new Entities();

  // Check that the message contains the first variable.
  var index = self.message.indexOf(self.firstVariableName);
  if (index === -1) {
    this.error = 'Unknown error - first variable (' + self.firstVariableName + ') not found';
    return;
  }

  // Parse message variables.
  self.message.substr(index).split('|').map(function (str) {
    if (str) {
      var key = str.substr(0, 2);
      var keyTrans = self.variablesResponseTranslation(key);
      var val = str.substr(2);

      // Init the field as an array.
      if (!self.hasOwnProperty(keyTrans)) {
        self[keyTrans] = [];
      }

      switch (key) {
        // Home address.
        case 'BD':
          val = val.split('%');
          self[keyTrans] = {
            street: entities.decode(val.shift()),
            postalCode: val.shift(),
            city: val.shift(),
            country: val.shift()
          };
          break;

        // Renewed items.
        case 'BM':
          val = val.split('%');
          if (val.length > 1) {
            self[keyTrans].push({
              id: val.shift(),
              dueDate: self.parseDate(val.shift()),
              title: entities.decode(val.shift()),
              author: entities.decode(val.shift()),
              GMB: val.shift(),
              SMB: val.shift(),
              DK5: val.shift()
            });
          }
          break;

        // Unrenewed items.
        case 'BN':
          val = val.split('%');
          if (val.length > 1) {
            self[keyTrans].push({
              id: val.shift(),
              reason: entities.decode(val.shift()),
              dueDate: self.parseDate(val.shift()),
              title: entities.decode(val.shift()),
              author: entities.decode(val.shift()),
              GMB: val.shift(),
              SMB: val.shift(),
              DK5: val.shift()
            });
          }
          break;

        // Pick-up location.
        case 'BS':
          // Filter out agency ('DK|FBS-123456') from pickup location.
          self[keyTrans] = val.match(/\w{2,3}-\d{6}\s-\s(.*)/)[1];
          break;

        // Hold items.
        case 'AS':
          val = val.split('%');
          if (val.length > 1) {
            self[keyTrans].push({
              bibliographicId: val.shift(),
              id: val.shift(),
              pickupId: val.shift(),
              pickupDate: self.parseDate(val.shift()),
              pickupLocation: val.shift().match(/\w{2,3}-\d{6}\s-\s(.*)/)[1],
              title: entities.decode(val.shift()),
              author: entities.decode(val.shift()),
              GMB: val.shift(),
              SMB: val.shift(),
              DK5: val.shift()
            });
          }
          break;

        // Overdue items.
        case 'AT':
          val = val.split('%');
          if (val.length > 1) {
            self[keyTrans].push({
              id: val.shift(),
              dueDate: self.parseDate(val.shift()),
              title: entities.decode(val.shift()),
              author: entities.decode(val.shift()),
              GMB: val.shift(),
              SMB: val.shift(),
              DK5: val.shift()
            });
          }
          break;

        // Fine items.
        case 'AV':
          val = val.split('%');
          if (val.length > 1) {
            self[keyTrans].push({
              id: val.shift(),
              fineId: val.shift(),
              fineDate: self.parseDate(val.shift()),
              fineAmount: val.shift(),
              title: entities.decode(val.shift()),
              author: entities.decode(val.shift()),
              GMB: val.shift(),
              SMB: val.shift(),
              DK5: val.shift()
            });
          }
          break;

        // Recall items.
        case 'BU':
          val = val.split('%');
          if (val.length > 1) {
            self[keyTrans].push({
              id: val.shift(),
              recallDate: self.parseDate(val.shift()),
              title: val.shift(),
              author: val.shift(),
              GMB: val.shift(),
              SMB: val.shift(),
              DK5: val.shift()
            });
          }
          break;

        // Unavailable hold items.
        case 'CD':
          val = val.split('%');
          if (val.length > 1) {
            self[keyTrans].push({
              bibliographicId: val.shift(),
              id: val.shift(),
              interestDate: self.parseDate(val.shift()),
              title: entities.decode(val.shift()),
              author: entities.decode(val.shift()),
              GMB: val.shift(),
              SMB: val.shift(),
              DK5: val.shift()
            });
          }
          break;

        // Charged items.
        case 'AU':
          val = val.split('%');
          if (val.length > 1) {
            self[keyTrans].push({
              id: val.shift(),
              returnDate: self.parseDate(val.shift()),
              title: entities.decode(val.shift()),
              author: entities.decode(val.shift()),
              GMB: val.shift(),
              SMB: val.shift()
            });
          }
          break;

        // Items properties.
        case 'CH':
          val = val.split('%');
          if (val.length > 1) {
            self[keyTrans] = {
              title: entities.decode(val.shift()),
              author: entities.decode(val.shift()),
              GMB: val.shift(),
              SMB: val.shift(),
              DK5: val.shift()
            };
          }
          break;

        // Due date.
        case 'AH':
          self[keyTrans] = self.parseDate(val);
          break;

        default:
          self[keyTrans] = val;
      }
    }
  });
};

/**
 * Check if error exists.
 *
 * @return {boolean}
 *   TRUE on error else FALSE.
 */
Response.prototype.hasError = function hasError() {
  return this.error !== '';
};

/**
 * Get error message.
 *
 * @return {string}
 *   The error message.
 */
Response.prototype.getError = function getError() {
  return this.error;
};

module.exports = Response;
