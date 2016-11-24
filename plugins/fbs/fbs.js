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

/**
 * Default constructor.
 *
 * @param bus
 *   The event bus.
 * @param config
 *   The FBS configuration.
 *
 * @constructor
 */
var FBS = function FBS(bus, config) {
  this.bus = bus;
  this.config = config;
};

// Extend the object with event emitter.
util.inherits(FBS, eventEmitter);

/**
 * Create new FBS object.
 *
 * Static factory function to create FBS object with loaded config. This pattern
 * used to fix race conditions and to ensure that we have an constructor
 * without side-effects.
 *
 * @param bus
 *   The event bus
 *
 * @returns {*|promise}
 *   Promise that the FBS object is created with configuration.
 */
FBS.create = function create(bus) {
  var deferred = Q.defer();

  bus.once('fbs.config.loaded', function (config) {
    deferred.resolve(new FBS(bus, config));
  });

  bus.once('fbs.config.error', function (err) {
    deferred.reject(err);
  });

  bus.emit('ctrl.config.fbs', {
    busEvent: 'fbs.config.loaded',
    errorEvent: 'fbs.config.error'
  });

  return deferred.promise;
};

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
      // Check that the user is valid.
      var valid = res.validPatron === 'Y' && res.validPatronPassword === 'Y';

      // If user is valid check for blocking codes.
      if (valid) {
        if (res.patronStatus.chargePrivDenied && res.patronStatus.renewalPrivDenied &&
            res.patronStatus.recallPrivDenied && res.patronStatus.holdPrivDenied) {
          deferred.reject(new Error('login.invalid_login_blocked'));
        }
        else {
          deferred.resolve();
        }
      }
      else {
        deferred.reject(new Error('login.invalid_login_error'));
      }
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
 * @param checkedOutDate
 *   Timestamp for the time that the item was checked out.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.checkout = function checkout(username, password, itemIdentifier, checkedOutDate) {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
  req.checkout(username, password, itemIdentifier, checkedOutDate, function (err, res) {
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
 * @param checkedInDate
 *   Timestamp for the time that the item was returned.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.checkIn = function checkIn(itemIdentifier, checkedInDate) {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
  req.checkIn(itemIdentifier, checkedInDate, function (err, res) {
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
 * Block patron.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param reason
 *   Reason for blocking user.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.block = function block(username, reason) {
  var deferred = Q.defer();

  var req = new Request(this.bus, this.config);
  req.blockPatron(username, reason, function (err, res) {
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

  // Create FBS object to use in tests.
  FBS.create(bus).then(function (fbs) {
    register(null, {
      fbs: fbs
    });
  }, function (err) {
    bus.emit('logger.err', err);
    register(null, {
      fbs: null
    });
  });

  /**
   * Listen to login requests.
   */
  bus.on('fbs.login', function (data) {
    FBS.create(bus).then(function (fbs) {
      fbs.login(data.username, data.password).then(function () {
        bus.emit(data.busEvent, {});
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    },
    function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen to library status requests.
   */
  bus.on('fbs.library.status', function (data) {
    FBS.create(bus).then(function (fbs) {
      fbs.libraryStatus().then(function (res) {
        bus.emit(data.busEvent, res);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    },
    function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen to patron status requests.
   */
  bus.on('fbs.patron', function (data) {
    FBS.create(bus).then(function (fbs) {
      fbs.patronInformation(data.username, data.password).then(function (status) {
        bus.emit(data.busEvent, status);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    },
    function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen to checkout requests.
   */
  bus.on('fbs.checkout', function (data) {
    // Check if this is a processing of offline queue.
    data.queued = data.queued || false;

    // Set checked-out date if not set.
    data.checkedOutDate = data.checkedOutDate || new Date().getTime();

    // Create FBS object and send checkout request.
    FBS.create(bus).then(function (fbs) {
      fbs.checkout(data.username, data.password, data.itemIdentifier, data.checkedOutDate).then(function (res) {
        bus.emit(data.busEvent, res);
      },
      function (err) {
        if (err.message === 'FBS is offline' && data.queued === false) {
          var material = {
            itemIdentifier: data.itemIdentifier,
            offline: true,
            ok: '1',
            itemProperties: {
              id: data.itemIdentifier,
              title: 'fbs.offline.title'
            }
          };

          bus.once('fbs.checkout.offline.stored' + data.itemIdentifier, function (res) {
            bus.emit(data.busEvent, material);
          });

          bus.once('fbs.checkout.offline.error' + data.itemIdentifier, function (err) {
            bus.emit(data.errorEvent, err);
          });

          // Store for later processing.
          var file = data.username;
          bus.emit('storage.append', {
            type: 'offline',
            name: file,
            obj: {
              date: data.checkedInDate,
              action: 'checkout',
              username: data.username,
              password: data.password,
              itemIdentifier: data.itemIdentifier
            },
            lockFile: true,
            busEvent: 'fbs.checkout.offline.stored' + data.itemIdentifier,
            errorEvent: 'fbs.checkout.offline.error' + data.itemIdentifier
          });

          // Add to job queue.
          data.file = file;
          bus.emit('offline.add.checkout', data);
        }
        else {
          debug(err);
          bus.emit(data.errorEvent, err);
        }
      });
    },
    function (err) {
      debug(err);
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen to checkIn requests.
   */
  bus.on('fbs.checkin', function (data) {
    // Check if this is a processing of offline queue.
    data.queued = data.queued || false;

    // Set checked-in date if not set.
    data.checkedInDate = data.checkedInDate || new Date().getTime();

    // Create FBS object and send check-in request.
    FBS.create(bus).then(function (fbs) {
      fbs.checkIn(data.itemIdentifier, data.checkedInDate).then(function (res) {
        bus.emit(data.busEvent, res);
      },
      function (err) {
        if (err.message === 'FBS is offline' && data.queued === false) {
          var material = {
            itemIdentifier: data.itemIdentifier,
            offline: true,
            ok: '1',
            itemProperties: {
              id: data.itemIdentifier,
              title: 'fbs.offline.title'
            }
          };

          bus.once('fbs.checkin.offline.stored' + data.itemIdentifier, function (res) {
            bus.emit(data.busEvent, material);
          });

          bus.once('fbs.checkin.offline.error' + data.itemIdentifier, function (err) {
            bus.emit(data.errorEvent, err);
          });

          // Store for later processing.
          var file = data.timestamp;
          bus.emit('storage.append', {
            type: 'offline',
            name: file,
            obj: {
              action: 'checkin',
              date: data.checkedInDate,
              itemIdentifier: data.itemIdentifier
            },
            lockFile: true,
            busEvent: 'fbs.checkin.offline.stored' + data.itemIdentifier,
            errorEvent: 'fbs.checkin.offline.error' + data.itemIdentifier
          });

          // Add to job queue.
          data.file = file;
          bus.emit('offline.add.checkin', data);
        }
        else {
          debug(err);
          bus.emit(data.errorEvent, err);
        }
      });
    },
    function (err) {
      debug(err);
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen to renew requests.
   */
  bus.on('fbs.renew', function (data) {
    FBS.create(bus).then(function (fbs) {
      fbs.renew(data.username, data.password, data.itemIdentifier).then(function (res) {
        bus.emit(data.busEvent, res);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    },
    function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen to renew all requests.
   */
  bus.on('fbs.renew.all', function (data) {
    FBS.create(bus).then(function (fbs) {
      fbs.renewAll(data.username, data.password).then(function (res) {
        bus.emit(data.busEvent, res);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    },
    function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen to block patron requests.
   */
  bus.on('fbs.block', function (data) {
    FBS.create(bus).then(function (fbs) {
      fbs.block(data.username, data.reason).then(function (res) {
        bus.emit(data.busEvent, res);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    },
    function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen for fbs.online events.
   */
  bus.on('fbs.online', function (request) {
    FBS.create(bus).then(function (fbs) {
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
  },
  function (err) {
    bus.emit(request.errorEvent, err);
  });
};
