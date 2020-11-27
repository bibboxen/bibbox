/**
 * @file
 * Handle sip2 response from FBS server.
 */

'use strict';

var handlebars = require('handlebars');
var fs = require('fs');
var debug = require('debug')('bibbox:FBS:request');

var Response = require('./response.js');

/**
 * Request object.
 *
 * @param bus
 *   Event bus.
 * @param config
 *   FBS connection config.
 */
var Request = function Request(bus, config) {
  var self = this;
  self.bus = bus;

  // Load template used for the XMl request.
  var source = fs.readFileSync(__dirname + '/templates/sip2_message.xml', 'utf8');
  self.template = handlebars.compile(source);

  self.username = config.username;
  self.password = config.password;
  self.endpoint = config.endpoint;
  self.agency = config.agency;
  self.location = config.location;
};

/**
 * Zero pad (one zero) number.
 *
 * Helper function to create sip2 timestamp.
 *
 * @param number
 *   Number to pad.
 *
 * @returns {string}
 *   Padded number.
 */
Request.prototype.zeroPad = function zeroPad(number) {
  return ('0' + (number)).slice(-2);
};

/**
 * Encode timestamp into sip2 date format.
 *
 * @param timestamp
 *   Javascript timestamp.
 *
 * @returns {string}
 *   The time as sip2 time string.
 */
Request.prototype.encodeTime = function encodeTime(timestamp) {
  if (!timestamp) {
    timestamp = new Date().getTime();
  }
  var d = new Date(timestamp);

  return '' + d.getFullYear() + this.zeroPad(d.getMonth() + 1) + this.zeroPad(d.getDate()) + '    ' + this.zeroPad(d.getHours()) + this.zeroPad(d.getMinutes()) + this.zeroPad(d.getSeconds());
};

/**
 * Use template to build XML message.
 *
 * @param message
 *   Message to wrap in XML.
 *
 * @returns {string}
 *   XML message.
 */
Request.prototype.buildXML = function buildXML(message) {
  var self = this;
  return self.template({
    username: self.username,
    password: self.password,
    message: message
  });
};

/**
 * Send request to FBS.
 *
 * @param message
 *   The message to send.
 * @param firstVar
 *   The first variable expected in the response.
 * @param callback
 *   Function to execute when data is fetched and parsed. Takes a Message object
 *   as parameter.
 */
Request.prototype.send = function send(message, firstVar, callback) {
  // Build XML message.
  var xml = this.buildXML(message);

  // Log message before sending it.
  this.bus.emit('logger.info', { 'type': 'FBS', 'message': message, 'xml': xml });

  var options = {
    method: 'POST',
    url: this.endpoint,
    headers: {
      'User-Agent': 'bibbox',
      'Content-Type': 'application/xml'
    },
    body: xml,
    timeout: 20000
  };

  try {
    var self = this;
    var request = require('request');
    request.post(options, function (error, response, body) {
      var res = null;
      if (error || response.statusCode !== 200) {
        if (!error) {
          res = new Response(body, firstVar);
          if (res.hasError()) {
            error = new Error(res.getError());
          }
          else {
            error = new Error('Unknown error', response.statusCode());
          }
        }

        // Log error message from FBS.
        self.bus.emit('logger.err', { 'type': 'FBS', 'message': error });
        callback(new Error('FBS is offline'), null);
      }
      else {
        // Send debug message.
        debug(response.statusCode + ':' + message.substr(0, 2));

        var err = null;
        res = new Response(body, firstVar);
        if (res.hasError()) {
          err = new Error(res.getError());
          self.bus.emit('logger.err', { 'type': 'FBS', 'message': err });
        }

        // Process the data.
        callback(err, res);

        // Log message from FBS.
        var sip2message = 'No message';
        if (res.hasError()) {
          sip2message = res.getError();
        } else {
          var sip2 = body.match(/<response>(.*)<\/response>/);
          sip2message = sip2[1];
        }
        self.bus.emit('logger.info', { 'type': 'FBS', 'message': sip2message, 'xml': body});
      }
    });
  }
  catch (error) {
    this.bus.emit('logger.info', { 'type': 'FBS', 'message': error.message});
    callback(new Error('FBS is offline'), null);
  }
};

/**
 * Send status message to FBS.
 *
 * @param callback
 *   Function to call when completed request to FBS.
 */
Request.prototype.libraryStatus = function libraryStatus(callback) {
  var self = this;
  self.send('990xxx2.00', 'AO', callback);
};

/**
 * Get patron status.
 *
 * @param patronId
 *   Patron card number or CPR number.
 * @param patronPassword
 *   Pin code/password for the patron.
 * @param callback
 *   Function to call when completed request to FBS.
 */
Request.prototype.patronStatus = function patronStatus(patronId, patronPassword, callback) {
  var self = this;
  var transactionDate = self.encodeTime();
  var message = '23009' + transactionDate + '|AO' + self.agency + '|AA' + patronId + '|AC|AD' + patronPassword + '|';

  self.send(message, 'AO', callback);
};

/**
 * Get all information about a patron.
 *
 * @param patronId
 *   Patron card number or CPR number.
 * @param patronPassword
 *   Pin code/password for the patron.
 * @param callback
 *   Function to call when completed request to FBS.
 */
Request.prototype.patronInformation = function patronInformation(patronId, patronPassword, callback) {
  var self = this;
  var transactionDate = self.encodeTime();
  var message = '63009' + transactionDate + new Array(10).join('Y') + '|AO' + self.agency + '|AA' + patronId + '|AC|AD' + patronPassword + '|';

  self.send(message, 'AO', callback);
};

/**
 * Check out item.
 *
 * @param patronId
 *   Patron card number or CPR number.
 * @param patronPassword
 *   Pin code/password for the patron.
 * @param itemIdentifier
 *   The item to checkout.
 * @param noBlockDueDate
 *   Timestamp for the time the book should be returned (when noBlock is true).
 * @param {bool} noBlock
 *   If true the check-out cannot be rejected by FBS.
 * @param {number} transactionDate
 *   Timestamp for when the user preformed the action.
 * @param {function} callback
 *   Function to call when completed request to FBS.
 */
Request.prototype.checkout = function checkout(patronId, patronPassword, itemIdentifier, noBlockDueDate, noBlock, transactionDate, callback) {
  var self = this;
  var transactionDateEncoded = self.encodeTime(transactionDate);
  var noBlockDueDateEncoded = self.encodeTime(noBlockDueDate);
  var message = '11N' + (noBlock ? 'Y' : 'N') + transactionDateEncoded + noBlockDueDateEncoded + '|AO' + self.agency + '|AA' + patronId + '|AB' + itemIdentifier + '|AC|CH|AD' + patronPassword + '|';

  self.send(message, 'AO', callback);
};

/**
 * Check in item.
 *
 * @param itemIdentifier
 *   The item to checkout.
 * @param checkedInDate
 *   Timestamp for the time that the item was returned.
 * @param noBlock
 *   If true the check-in cannot be rejected by FBS.
 * @param callback
 *   Function to call when completed request to FBS.
 */
Request.prototype.checkIn = function checkIn(itemIdentifier, checkedInDate, noBlock, callback) {
  var self = this;
  var checkedInDateEncoded = self.encodeTime(checkedInDate);
  var message = '09' + (noBlock ? 'Y' : 'N') + checkedInDateEncoded + checkedInDateEncoded + '|AP' + self.location + '|AO' + self.agency + '|AB' + itemIdentifier + '|AC|CH|';

  self.send(message, 'AO', callback);
};

/**
 * Renew item.
 *
 * @param patronId
 *   Patron card number or CPR number.
 * @param patronPassword
 *   Pin code/password for the patron.
 * @param itemIdentifier
 *   The item to renew.
 * @param callback
 *   Function to call when completed request to FBS.
 */
Request.prototype.renew = function renew(patronId, patronPassword, itemIdentifier, callback) {
  var self = this;
  var transactionDate = self.encodeTime();
  var message = '29NN' + transactionDate + transactionDate + '|AO' + self.agency + '|AA' + patronId + '|AD' + patronPassword + '|AB' + itemIdentifier + '|';

  self.send(message, 'AO', callback);
};

/**
 * Renew all items.
 *
 * @param patronId
 *   Patron card number or CPR number.
 * @param patronPassword
 *   Pin code/password for the patron.
 * @param callback
 *   Function to call when completed request to FBS.
 */
Request.prototype.renewAll = function renewAll(patronId, patronPassword, callback) {
  var self = this;
  var transactionDate = self.encodeTime();
  var message = '65' + transactionDate + '|AO' + self.agency + '|AA' + patronId + '|AD' + patronPassword + '|';

  self.send(message, 'AO', callback);
};

/**
 * Block patron.
 *
 * Note: that there is not response form SIP2 on this call.
 *
 * @param patronId
 *   Patron card number or CPR number.
 * @param reason
 *   Message with reason for the user being blocked.
 * @param callback
 *   Function to call when completed request to FBS.
 */
Request.prototype.blockPatron = function blockPatron(patronId, reason, callback) {
  var self = this;
  var transactionDate = self.encodeTime();
  var message = '01N' + transactionDate + '|AO' + self.agency + '|AL' + reason + '|AA' + patronId + '|';

  self.send(message, 'AO', callback);
};

module.exports = Request;
