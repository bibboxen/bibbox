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

  var req = new Request(this.bus);
  req.libraryStatus(function (err, response) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(response);
    }
  });

  return deferred.promise;
};

/**
 * Login check.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param password
 *   The patrons password.
 *
 * @returns {*|promise}
 *   TRUE if valid else FALSE.
 */
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
 * Get all available information about a patron.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param password
 *   The patrons password.
 *
 * @returns {*|promise}
 *   JSON object with information or FALSE on failure.
 */
FBS.prototype.patronInformation = function patronInformation(username, password) {
  var deferred = Q.defer();

  var req = new Request(this.bus);
  req.patronInformation(username, password, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(res);
    }
  });

  return deferred.promise;
};

/**
 * Checkout (loan) item.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param password
 *   The patrons password.
 * @param itemIdentifier
 *   The item to checkout.
 *
 * @returns {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.checkout = function checkout(username, password, itemIdentifier) {
  var deferred = Q.defer();

  var req = new Request(this.bus);
  req.checkout(username, password, itemIdentifier, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(res);
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
      bus.emit(data.busEvent, isLoggedIn);
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
      bus.emit(data.busEvent, res);
    },
    function (err) {
      bus.emit('fbs.err', err);
      bus.emit(data.busEvent, false);
    });
  });

  /**
   * Listen to patron status requests.
   */
  bus.on('fbs.patron', function (data) {
    fbs.patronInformation(data.username, data.password).then(function (isLoggedIn) {
      bus.emit(data.busEvent, isLoggedIn);
    },
    function (err) {
      bus.emit('fbs.err', err);
      bus.emit(data.busEvent, false);
    });
  });

  /**
   * Listen to checkout requests.
   */
  bus.on('fbs.checkout', function (data) {
    fbs.checkout(data.username, data.password).then(function (res) {
        bus.emit(data.busEvent, res);
      },
      function (err) {
        bus.emit('fbs.err', err);
        bus.emit(data.busEvent, false);
      });
  });

  register(null, { "fbs": fbs });
};
