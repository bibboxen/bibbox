/**
 * @file
 * Handles communication with FBS through SIP2.
 */
var util = require('util');
var eventEmitter = require('events').EventEmitter;
var Q = require('q');

var Request = require('./request.js');


var FBS = function FBS(bus) {
  "use strict";

  this.bus = bus;
};

// Extend the object with event emitter.
util.inherits(FBS, eventEmitter);

/**
 * Send status message to FBS.
 */
FBS.prototype.libraryStatus = function libraryStatus() {
  var deferred = Q.defer();

  var self = this;

  self.send('990xxx2.00', 'AO', function (err, response) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(response);
    }
  });

  return deferred.promise;
};

FBS.prototype.login = function login(username, password) {
  var deferred = Q.defer();

  var req = new Request(this.bus);
  req.patronStatus(username, password, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(res.validPatron === 'Y' && res.validPatronPassword === 'Y');
    }
  });

  return deferred.promise;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;
	var fbs = new FBS(bus);

  /**
   * Listen to login requests.
   */
  bus.on('fbs.login', function (data) {
    fbs.login(data.username, data.password).then(function (isLoggedIn) {
      bus.emit(data.busEvent, isLoggedIn)
    },
    function (err) {
      bus.emit('fbs.err', err);
      bus.emit(data.busEvent, false);
    });
  });

  /**
   * Listen to library status requests.
   */
  bus.on('fbs.library.status', function (data) {
    fbs.libraryStatus().then(function (res) {
      bus.emit(data.busEvent, res)
    },
    function (err) {
      bus.emit('fbs.err', err);
      bus.emit(data.busEvent, false);
    });
  });


  //fbs.patronInformation('', '12345', function)

  register(null, { "fbs": fbs });
};
