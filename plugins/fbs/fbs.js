/**
 * @file
 * Handles communication with FBS through SIP2.
 */

'use strict';

var util = require('util');
var eventEmitter = require('events').EventEmitter;
var Q = require('q');

var debug = require('debug')('bibbox:FBS:main');

var Request = require('./request.js');

var FBS = function FBS(bus) {
  var self = this;
  self.bus = bus;

  // @TODO: Handel config updates.
  // @TODO: Handel config = false (missing config).
  bus.once('fbs.config.loaded', function (config) {
    self.config = config;
  });
  bus.emit('ctrl.config.fbs', {
    busEvent: 'fbs.config.loaded'
  });
};

// Extend the object with event emitter.
util.inherits(FBS, eventEmitter);

/**
 * Send status message to FBS.
 */
FBS.prototype.libraryStatus = function libraryStatus() {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
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
 * @return {*|promise}
 *   TRUE if valid else FALSE.
 */
FBS.prototype.login = function login(username, password) {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
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
 * @return {*|promise}
 *   JSON object with information or FALSE on failure.
 */
FBS.prototype.patronInformation = function patronInformation(username, password) {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
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
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.checkout = function checkout(username, password, itemIdentifier) {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
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
 * Check-in (return) item.
 *
 * @param itemIdentifier
 *   The item to checkout.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.checkIn = function checkIn(itemIdentifier) {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
  req.checkIn(itemIdentifier, function (err, res) {
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
 * Renew item.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param password
 *   The patrons password.
 * @param itemIdentifier
 *   The item to renew.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.renew = function renew(username, password, itemIdentifier) {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
  req.renew(username, password, itemIdentifier, function (err, res) {
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
 * Renew all items.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param password
 *   The patrons password.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.renewAll = function renewAll(username, password) {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
  req.renewAll(username, password, function (err, res) {
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

      if (data.errorEvent) {
        bus.emit(data.errorEvent, {
          message: err.message
        });
      }
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
    fbs.patronInformation(data.username, data.password).then(function (status) {
      bus.emit(data.busEvent, status);
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
    fbs.checkout(data.username, data.password, data.itemIdentifier).then(function (res) {
      bus.emit(data.busEvent, res);
    },
    function (err) {
      if (err.message === 'FBS is offline') {
        var material = {
          itemIdentifier: data.itemIdentifier,
          offline: true,
          ok: '1',
          itemProperties: {
            title: data.itemIdentifier
          }
        };

        // @TODO: Save in storage for delivery later.

        bus.emit(data.busEvent, material);

        console.log('Accepted offline borrow');
      }
      else {
        bus.emit('fbs.err', err);

        if (data.errorEvent) {
          bus.emit(data.errorEvent, {
            message: err.message
          });
        }
      }
    });
  });

  /**
   * Listen to checkIn requests.
   */
  bus.on('fbs.checkin', function (data) {
    fbs.checkIn(data.itemIdentifier).then(function (res) {
      bus.emit(data.busEvent, res);
    },
    function (err) {
      if (err.message === 'FBS is offline') {
        var material = {
          itemIdentifier: data.itemIdentifier,
          offline: true,
          ok: '1',
          itemProperties: {
            title: data.itemIdentifier
          }
        };

        // @TODO: Save in storage for delivery later.

        bus.emit(data.busEvent, material);

        console.log('Accepted offline borrow');
      }
      else {
        bus.emit('fbs.err', err);

        if (data.errorEvent) {
          bus.emit(data.errorEvent, {
            message: err.message
          });
        }
      }
    });
  });

  /**
   * Listen to renew requests.
   */
  bus.on('fbs.renew', function (data) {
    fbs.renew(data.username, data.password, data.itemIdentifier).then(function (res) {
      bus.emit(data.busEvent, res);
    },
    function (err) {
      bus.emit('fbs.err', err);
      bus.emit(data.busEvent, false);
    });
  });

  /**
   * Listen to renew all requests.
   */
  bus.on('fbs.renew.all', function (data) {
    fbs.renewAll(data.username, data.password).then(function (res) {
      bus.emit(data.busEvent, res);
    },
    function (err) {
      bus.emit('fbs.err', err);
      bus.emit(data.busEvent, false);
    });
  });

  /**
   * Listen for fbs.online events.
   */
  bus.on('fbs.online', function (request) {
    // Check that config exists.
    if (fbs.config && fbs.config.hasOwnProperty('endpoint')) {
      // Listen to online check event send below.
      bus.once('network.fbs.online', function (online) {
        bus.emit(request.busEvent, online);
      });

      // Send online check.
      bus.emit('network.online', {
        url: fbs.config.endpoint,
        busEvent: 'network.fbs.online'
      });
    }
    else {
      bus.emit(request.busEvent, false);
    }
  });

  register(null, {
    fbs: fbs
  });
};
