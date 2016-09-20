/**
 * @file
 * Handles communication with FBS through SIP2.
 */
var util = require('util');
var eventEmitter = require('events').EventEmitter;
var fs = require('fs');

var handlebars = require('handlebars');

var FBS = function FBS(bus) {
  "use strict";

  var self = this;
  self.bus = bus;

  bus.on('config.fbs.res', function fbsConfig(data) {
    self.username = data.username;
    self.password = data.password;
    self.endpoint = data.endpoint;
  });
  bus.emit('config.fbs', 'config.fbs.res');
};

// Extend the object with event emitter.
util.inherits(FBS, eventEmitter);


var Message = function Message(xml, firstVariableName) {
  this.xml = xml;
  this.firstVariableName = firstVariableName;

  // Parse message from XML.
  this.parseXML();

  // Extract variables.
  this.parseVariables();

  // Parse chars before variables in message.
  this.parseEncoding();

};

Message.prototype.parseEncoding = function parseEncoding() {
  var self = this;

  /**
   * Inner helper function to decode the endocde string.
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

  var mappings = [];
  switch (self.id) {
    // Patron Status Response.
    case '24':
      mappings.push(['patronStatus', 14, 24]);
      mappings.push(['language', 3]);
      mappings.push(['transactionDate', 18]);
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

    case '':
      break;

    case '':
      break;

    case '':
      break;

    case '':
      break;

    case '':
      break;

    case '':
      break;

    case '':
      break;
  }

  mappings.map(function (conf) {
    if (conf.length > 2) {
      // Parse sub-fields.
      switch (conf[2]) {
        case '24':
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
            self[conf[0]][items[0]] = items[1];
          });
          break;
      }
    }
    else {
      self[conf[0]] = decode.consume(conf[1]);
    }
  });

};


Message.prototype.parseXML = function parseXML() {
  this.message = this.xml.match(/(<response>)(.*)(<\/response>)/)[2];
};

Message.prototype.parseVariables = function parseVariables() {
  var self = this;

  self.message.substr(self.message.indexOf(self.firstVariableName)).split('|').map(function (str) {
    if (str) {
      self[str.substr(0, 2)] = str.substr(2);
    }
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
FBS.prototype.send = function send(message, firstVar, callback) {
  var self = this;
  self.bus.once('fbs.sip2.online', function(online) {
    if (online) {
      fs.readFile(__dirname + '/templates/sip2_message.xml', 'utf-8', function(error, source) {
        var template = handlebars.compile(source);
        var xml = template({
          'username': self.username,
          'password': self.password,
          'message': message
        });

        var options = {
          'method': 'POST',
          'url': self.endpoint,
          'headers': {
            'User-Agent': 'bibbox',
            'Content-Type': 'application/xml'
          },
          'body': xml
        };

        // Log message sent to FBS.
        self.bus.emit('logger.debug', 'FBS send: ' + xml);

        var request = require('request');
        request.post(options, function(error, response, body) {
          if (error || response.statusCode !== 200) {
            // Log error message from FBS.
            self.bus.emit('logger.error', 'FBS error: ' + error + ' <-> ' + response.statusCode);

            callback(error, '');
          }
          else {
            // Log message from FBS.
            self.bus.emit('logger.debug', 'FBS response: ' + body);

            var message = new Message(body, firstVar);
            callback(null, message);
          }
        });
      });
    }
    else {
      /**
       * @TODO: Handle off-line mode for FBS.
       */
      self.bus.emit('logger.err', '@TODO: Handle off-line mode for FBS');
    }
  });
  self.bus.emit('network.online', {
    'url': self.endpoint,
    'callback': 'fbs.sip2.online'
  });
};

FBS.prototype.status = function status(callback) {
  var self = this;

  self.send('990xxx2.00', 'AO', function (err, message) {
    console.log(message);
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {


	var fbs = new FBS(imports.bus);
  fbs.status('test');

  register(null, { "fbs": fbs });
};
