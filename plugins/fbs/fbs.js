/**
 * @file
 * Handles communication with FBS through SIP2.
 */
var util = require('util');
var eventEmitter = require('events').EventEmitter;
var fs = require('fs');

var handlebars = require('handlebars');

var Response = require('./response.js');

var FBS = function FBS(bus) {
  "use strict";

  var self = this;
  self.bus = bus;

  bus.on('config.fbs.res', function fbsConfig(data) {
    self.username = data.username;
    self.password = data.password;
    self.endpoint = data.endpoint;
    self.agency = data.agency;
  });
  bus.emit('config.fbs', 'config.fbs.res');
};

// Extend the object with event emitter.
util.inherits(FBS, eventEmitter);

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

            callback(error, null);
          }
          else {
            // Log message from FBS.
            self.bus.emit('logger.debug', 'FBS response: ' + body);

            var err = null;
            var res = new Response(body, firstVar);
            if (res.hasError()) {
              err = res.getError();
            }
            callback(err, res);
          }
        });
      });
    }
    else {
      self.bus.emit('fbs.offline');
      callback(new Error('FBS is off-line'), null);
    }
  });

  // Check if server is online (FBS).
  self.bus.emit('network.online', {
    'url': self.endpoint,
    'callback': 'fbs.sip2.online'
  });
};

FBS.prototype.zeroPad = function zeroPad(number) {
  return ('0' + (number)).slice(-2)
};

FBS.prototype.encodeTime = function encodeTime(timestamp) {
  if (!timestamp) {
    timestamp = Math.floor(new Date().getTime() / 1000);
  }
  var d = new Date(timestamp * 1000);
  return '' + d.getFullYear() + this.zeroPad(d.getMonth() + 1) + this.zeroPad(d.getDate()) + '    ' + this.zeroPad(d.getHours()) + this.zeroPad(d.getMinutes()) + this.zeroPad(d.getSeconds());
};

/**
 * Send status message to FBS.
 *
 * @param busMsg
 *   Message to send into the bus when parsed.
 */
FBS.prototype.status = function status(busMsg) {
  var self = this;

  self.send('990xxx2.00', 'AO', function (err, response) {
    if (err) {
      self.bus.emit('logger.err', err);
    }
    else {
      console.log(response);
      self.bus.emit(busMsg, response);
    }
  });
};

FBS.prototype.patronStatus = function patronStatus(busMsg, patronId, patronPassword) {
  var self = this;

  var transactionDate = self.encodeTime();
  var message = '23DAN' + transactionDate + '|AO' + self.agency + '|AA' + patronId + '|AC|AD' + patronPassword + '|';
  self.send(message, 'AO', function (err, response) {
    if (err) {
      console.log(err);
      self.bus.emit('logger.err', err);
    }
    else {
      console.log(response);
      self.bus.emit(busMsg, response);
    }
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;
	var fbs = new FBS(bus);

  bus.on('fbs.status', fbs.status);

  fbs.patronStatus('test', '3208100032', '12345');

  register(null, { "fbs": fbs });
};
