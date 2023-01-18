/**
 * @file
 * Handles communication with FBS through SIP2.
 */

'use strict';

var util = require('util');
var eventEmitter = require('events').EventEmitter;
var Q = require('q');
var uniqid = require('uniqid');

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
 * used to fix race conditions and to ensure that we have a constructor
 * without side effects.
 *
 * @param bus
 *   The event bus
 *
 * @returns {*|promise}
 *   Promise that the FBS object is created with configuration.
 */
FBS.create = function create(bus) {
  var deferred = Q.defer();
  var busEvent = 'fbs.config.loaded' + uniqid();
  var errorEvent = 'fbs.config.error' + uniqid();

  bus.once(busEvent, function (config) {
    deferred.resolve(new FBS(bus, config));
  });

  bus.once(errorEvent, function (err) {
    deferred.reject(err);
  });

  bus.emit('ctrl.config.fbs', {
    busEvent: busEvent,
    errorEvent: errorEvent
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
  var bus = this.bus;

  var req = new Request(this.bus, this.config);
  req.patronStatus(username, password, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      // Check that the user is valid.
      var valid = res.hasOwnProperty('validPatron') && res.validPatron === 'Y' && res.validPatronPassword === 'Y';

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
    bus.emit('fbs.action.result', 'Login', !!err);
  });

  return deferred.promise;
};

/**
 * Get all available information about a patron.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param password
 *   The patron's password.
 *
 * @return {*|promise}
 *   JSON object with information or FALSE on failure.
 */
FBS.prototype.patronInformation = function patronInformation(username, password) {
  var deferred = Q.defer();
  var bus = this.bus;

  var req = new Request(this.bus, this.config);
  req.patronInformation(username, password, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(res);
    }
    bus.emit('fbs.action.result', 'Patron Information', !!err);
  });

  return deferred.promise;
};

/**
 * Checkout (loan) item.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param password
 *   The patron's password.
 * @param itemIdentifier
 *   The item to check out.
 * @param noBlockDueDate
 *   Timestamp for the time the book should be returned (when noBlock is true).
 * @param {bool} noBlock
 *   If true the request can not be blocked by the library system.
 * @param {number} transactionDate
 *   Timestamp for when the user preformed the action.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.checkout = function checkout(username, password, itemIdentifier, noBlockDueDate, noBlock, transactionDate) {
  var deferred = Q.defer();
  var bus = this.bus;

  var req = new Request(this.bus, this.config);
  req.checkout(username, password, itemIdentifier, noBlockDueDate, noBlock, transactionDate, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(res);
    }
    bus.emit('fbs.action.result', 'Checkout', !!err);
  });

  return deferred.promise;
};

/**
 * Check-in (return) item.
 *
 * @param itemIdentifier
 *   The item to check out.
 * @param checkedInDate
 *   Timestamp for the time that the item was returned.
 * @param {bool} noBlock
 *   If true the request can not be blocked by the library system.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.checkIn = function checkIn(itemIdentifier, checkedInDate, noBlock) {
  var deferred = Q.defer();
  var bus = this.bus;

  var req = new Request(this.bus, this.config);
  req.checkIn(itemIdentifier, checkedInDate, noBlock, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(res);
    }
    bus.emit('fbs.action.result', 'Checkin', !!err);
  });

  return deferred.promise;
};

/**
 * Renew item.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param password
 *   The patron's password.
 * @param itemIdentifier
 *   The item to renew.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.renew = function renew(username, password, itemIdentifier) {
  var deferred = Q.defer();
  var bus = this.bus;

  var req = new Request(this.bus, this.config);
  req.renew(username, password, itemIdentifier, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(res);
    }
    bus.emit('fbs.action.result', 'Renew', !!err);
  });

  return deferred.promise;
};

/**
 * Renew all items.
 *
 * @param username
 *   Username for the patron (card or CPR number).
 * @param password
 *   The patron's password.
 *
 * @return {*|promise}
 *   JSON object with information or error message on failure.
 */
FBS.prototype.renewAll = function renewAll(username, password) {
  var deferred = Q.defer();
  var bus = this.bus;

  var req = new Request(this.bus, this.config);
  req.renewAll(username, password, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(res);
    }
    bus.emit('fbs.action.result', 'Renew All', !!err);
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
  var bus = this.bus;

  var req = new Request(this.bus, this.config);
  req.blockPatron(username, reason, function (err, res) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(res);
    }
    bus.emit('fbs.action.result', 'Block', !!err);
  });

  return deferred.promise;
};

/**
 * Register the plugin with architect.
 *
 * @param {array} options
 *   Options defined in app.js.
 * @param {array} imports
 *   The other plugins available.
 * @param {function} register
 *   Callback function used to register this plugin.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;
  var crypt = imports.crypt;

  // Defines the configuration for the online checker below.
  var onlineState = {
    online: true,
    threshold: 5,
    successfulOnlineChecks: 5,
    onlineTimeout: 5000,
    offlineTimeout: 30000,
    ensureOnlineCheckTimeout: 300000
  };

  var checkOnlineStateTimeout = null;
  var ensureCheckOnlineStateTimeout = null;

  /**
   * Online checker.
   *
   * State machine that handles the FBS online/offline state.
   */
  function checkOnlineState() {
    // Clear extra timeout, to make sure only one is running.
    if (ensureCheckOnlineStateTimeout != null) {
      clearTimeout(ensureCheckOnlineStateTimeout);
    }

    // Start extra timeout.
    ensureCheckOnlineStateTimeout = setTimeout(checkOnlineState, onlineState.onlineTimeout + onlineState.ensureOnlineCheckTimeout);

    // Make sure only one checkOnlineStateTimeout is running.
    if (checkOnlineStateTimeout != null) {
      clearTimeout(checkOnlineStateTimeout);
      checkOnlineStateTimeout = null;
    }

    // Start online checker for FBS servers.
    FBS.create(bus).then(function (fbs) {
      // Update configuration - It's done here to ensure it reflects updated
      // configuration from the admin UI.
      onlineState.threshold = fbs.config.hasOwnProperty('onlineState') ? fbs.config.onlineState.threshold : onlineState.threshold;
      onlineState.onlineTimeout = fbs.config.hasOwnProperty('onlineState') ? fbs.config.onlineState.onlineTimeout : onlineState.onlineTimeout;
      onlineState.offlineTimeout = fbs.config.hasOwnProperty('onlineState') ? fbs.config.onlineState.offlineTimeout : onlineState.offlineTimeout;

      // Check that config exists.
      if (fbs.config && fbs.config.hasOwnProperty('endpoint')) {
        fbs.libraryStatus().then(
          function (res) {
            // Listen to online check event send below.
            if (res.hasOwnProperty('onlineStatus') && res.onlineStatus) {
              if (onlineState.successfulOnlineChecks >= onlineState.threshold) {
                // FBS is online and threshold has been reached, so state online.
                checkOnlineStateTimeout = setTimeout(checkOnlineState, onlineState.onlineTimeout);
                onlineState.online = true;
              }
              else {
                // FBS online but threshold _not_ reached, so state offline.
                onlineState.successfulOnlineChecks++;
                onlineState.online = false;
                checkOnlineStateTimeout = setTimeout(checkOnlineState, onlineState.offlineTimeout);
              }
            }
            else {
              // FBS is offline, so it the state.
              onlineState.successfulOnlineChecks = 0;
              onlineState.online = false;
              checkOnlineStateTimeout = setTimeout(checkOnlineState, onlineState.offlineTimeout);
            }

            // Send state event into the bus.
            var eventName = onlineState.online ? 'fbs.online' : 'fbs.offline';
            bus.emit(eventName, {
              timestamp: new Date().getTime(),
              online: onlineState
            });
          },
          function (err) {
            // Error connecting to FBS.
            onlineState.online = false;
            onlineState.successfulOnlineChecks = 0;
            checkOnlineStateTimeout = setTimeout(checkOnlineState, onlineState.offlineTimeout);
            bus.emit('fbs.offline', {
              timestamp: new Date().getTime(),
              online: onlineState
            });
          }
        );
      }
      else {
        // FBS not configured, so state offline.
        onlineState.online = false;
        onlineState.successfulOnlineChecks = 0;
        checkOnlineStateTimeout = setTimeout(checkOnlineState, onlineState.offlineTimeout);
        bus.emit('fbs.offline', {
          timestamp: new Date().getTime(),
          online: onlineState
        });
      }
    },
    function (err) {
      bus.emit('logger.info', 'checkOnlineState: FBS.create(bus) promise failed. Retrying.');

      // Retry check.
      checkOnlineStateTimeout = setTimeout(checkOnlineState, onlineState.offlineTimeout);
    });
  }

  // Start the online checker.
  checkOnlineState();

  /**
   * Listen to login requests.
   */
  bus.on('fbs.login', function (data) {
    if (onlineState.online) {
      FBS.create(bus).then(function (fbs) {
        fbs.login(data.username, data.password).then(function () {
            bus.emit(data.busEvent, {
              timestamp: new Date().getTime()
            });
          },
          function (err) {
            bus.emit(data.errorEvent, err);
          }
        );
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
    else {
      bus.emit(data.errorEvent, new Error('FBS is offline'));
    }
  });

  /**
   * Listen to library status requests.
   */
  bus.on('fbs.library.status', function (data) {
    if (onlineState.online) {
      FBS.create(bus).then(function (fbs) {
        fbs.libraryStatus().then(function (res) {
            bus.emit(data.busEvent, {
              timestamp: new Date().getTime(),
              results: res
            });
          },
          function (err) {
            bus.emit(data.errorEvent, err);
          }
        );
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
    else {
      bus.emit(data.errorEvent, new Error('FBS is offline'));
    }
  });

  /**
   * Listen to patron status requests.
   */
  bus.on('fbs.patron', function (data) {
    if (onlineState.online) {
      FBS.create(bus).then(function (fbs) {
        fbs.patronInformation(data.username, data.password).then(function (status) {
            // Sort based on pickup id (which is the placement string).
            if (status.hasOwnProperty('holdItems')) {
              status.holdItems.sort(function (a, b) {
                if ( a.pickupId < b.pickupId ){
                  return -1;
                }
                if ( a.pickupId > b.pickupId ){
                  return 1;
                }
                return 0;
              });
            }

            bus.emit(data.busEvent, {
              timestamp: new Date().getTime(),
              patron: status
            });
          },
          function (err) {
            bus.emit(data.errorEvent, err);
          }
        );
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
    else {
      bus.emit(data.errorEvent, new Error('FBS is offline'));
    }
  });

  /**
   * Listen to checkout requests.
   */
  bus.on('fbs.checkout', function (data) {
    // Check if this is a processing of offline queue.
    data.queued = data.queued || false;

    // Decrypt date if it has been in a queue.
    if (true === data.queued) {
      data.date = crypt.decrypt(data.checkedInDate);
      data.username = crypt.decrypt(data.username);
      data.password = crypt.decrypt(data.password);
      data.itemIdentifier = crypt.decrypt(data.itemIdentifier);
    }

    // Set noBlock due date if not set. This due data is ignored if the noBlock
    // field is false. So we set it to expire in 31 days into the future, so if
    // this gets into the offline queue and gets noBlocked the date is set.
    if (!data.hasOwnProperty('noBlockDueDate')) {
      data.noBlockDueDate = new Date().getTime() + 2678400000;
    }

    // Ensure that the noBlock parameter to FBS is set to 'N' as default.
    // NoBlock have been added in a later release a may not be in all
    // request.
    var noBlock = data.hasOwnProperty('noBlock') ? data.noBlock : false;

    // Set transaction date if not set already (offline queued item will have
    // the date already).
    data.transactionDate = data.transactionDate || new Date().getTime();

    // Create FBS object and send checkout request.
    if (onlineState.online) {
      FBS.create(bus).then(function (fbs) {
        fbs.checkout(data.username, data.password, data.itemIdentifier, data.noBlockDueDate, noBlock, data.transactionDate).then(function (res) {
            bus.emit(data.busEvent, {
              timestamp: new Date().getTime(),
              result: res
            });
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
                },
                dueDate: data.noBlockDueDate
              };

              bus.emit(data.busEvent, {
                timestamp: new Date().getTime(),
                result: material
              });

              // Add to job queue (clone data object first to ensure no-side-effect and encrypt).
              var jobData = JSON.parse(JSON.stringify(data));
              jobData.date = crypt.encrypt(data.checkedInDate);
              jobData.username = crypt.encrypt(data.username);
              jobData.password = crypt.encrypt(data.password);
              jobData.itemIdentifier = crypt.encrypt(data.itemIdentifier);
              bus.emit('offline.add.checkout', jobData);
            }
            else {
              debug(err);
              bus.emit(data.errorEvent, err);
            }
          }
        );
      },
      function (err) {
        debug(err);
        bus.emit(data.errorEvent, err);
      });
    }
    else {
      // FBS is offline, so create do offline work.
      if (data.queued === false) {
        var material = {
          itemIdentifier: data.itemIdentifier,
          offline: true,
          ok: '1',
          itemProperties: {
            id: data.itemIdentifier,
            title: 'fbs.offline.title'
          },
          dueDate: data.noBlockDueDate
        };

        bus.emit(data.busEvent, {
          timestamp: new Date().getTime(),
          result: material
        });

        // Add to job queue (clone data object first to ensure no-side-effect and encrypt).
        var jobData = JSON.parse(JSON.stringify(data));
        jobData.date = crypt.encrypt(data.checkedInDate);
        jobData.username = crypt.encrypt(data.username);
        jobData.password = crypt.encrypt(data.password);
        jobData.itemIdentifier = crypt.encrypt(data.itemIdentifier);
        bus.emit('offline.add.checkout', jobData);
      }
      else {
        debug(err);
        bus.emit(data.errorEvent, err);
      }
    }
  });

  /**
   * Listen to checkIn requests.
   */
  bus.on('fbs.checkin', function (data) {
    // Check if this is a processing of offline queue.
    data.queued = data.queued || false;

    // Decrypt date if it has been in a queue.
    if (true === data.queued) {
      data.itemIdentifier = crypt.decrypt(data.itemIdentifier);
      data.checkedInDate = crypt.decrypt(data.checkedInDate);
    }

    // Set checked-in date if not set.
    data.checkedInDate = data.checkedInDate || new Date().getTime();

    // Create FBS object and send check-in request.
    if (onlineState.online) {
      FBS.create(bus).then(function (fbs) {
        // Ensure that the noBlock parameter to FBS is set to 'N' as default.
        // NoBlock have been added in a later release a may not be in all requests.
        var noBlock = data.hasOwnProperty('noBlock') ? data.noBlock : false;

        // Perform the checking request.
        fbs.checkIn(data.itemIdentifier, data.checkedInDate, noBlock).then(function (res) {
            bus.emit(data.busEvent, {
              timestamp: new Date().getTime(),
              result: res
            });
          },
          function (err) {
            if (err.message === 'FBS is offline' && false === data.queued) {
              var material = {
                itemIdentifier: data.itemIdentifier,
                offline: true,
                ok: '1',
                itemProperties: {
                  id: data.itemIdentifier,
                  title: 'fbs.offline.title'
                }
              };

              bus.emit(data.busEvent, {
                timestamp: new Date().getTime(),
                result: material
              });

              // Add to job queue (clone data object first to ensure no-side-effect and encrypt).
              var jobData = JSON.parse(JSON.stringify(data));
              jobData.checkedInDate = crypt.encrypt(jobData.checkedInDate);
              jobData.itemIdentifier = crypt.encrypt(jobData.itemIdentifier);
              bus.emit('offline.add.checkin', jobData);
            }
            else {
              debug(err);
              bus.emit(data.errorEvent, err);
            }
          }
        );
      },
      function (err) {
        debug(err);
        bus.emit(data.errorEvent, err);
      });
    }
    else {
      // FBS is offline, so create do offline work.
      if (data.queued === false) {
        var material = {
          itemIdentifier: data.itemIdentifier,
          offline: true,
          ok: '1',
          itemProperties: {
            id: data.itemIdentifier,
            title: 'fbs.offline.title'
          }
        };

        bus.emit(data.busEvent, {
          timestamp: new Date().getTime(),
          result: material
        });

        // Add to job queue (clone data object first to ensure no-side-effect and encrypt).
        var jobData = JSON.parse(JSON.stringify(data));
        jobData.checkedInDate = crypt.encrypt(jobData.checkedInDate);
        jobData.itemIdentifier = crypt.encrypt(jobData.itemIdentifier);
        bus.emit('offline.add.checkin', jobData);
      }
      else {
        debug(err);
        bus.emit(data.errorEvent, err);
      }
    }
  });

  /**
   * Listen to renew requests.
   */
  bus.on('fbs.renew', function (data) {
    if (onlineState.online) {
      FBS.create(bus).then(function (fbs) {
        fbs.renew(data.username, data.password, data.itemIdentifier).then(function (res) {
            bus.emit(data.busEvent, {
              timestamp: new Date().getTime(),
              result: res
            });
          },
          function (err) {
            bus.emit(data.errorEvent, err);
          });
        },
        function (err) {
          bus.emit(data.errorEvent, err);
        }
      );
    }
    else {
      bus.emit(data.errorEvent, new Error('FBS is offline'));
    }
  });

  /**
   * Listen to renew all requests.
   */
  bus.on('fbs.renew.all', function (data) {
    if (onlineState.online) {
      FBS.create(bus).then(function (fbs) {
        fbs.renewAll(data.username, data.password).then(function (res) {
            bus.emit(data.busEvent, {
              timestamp: new Date().getTime(),
              result: res
            });
          },
          function (err) {
            bus.emit(data.errorEvent, err);
          });
        },
        function (err) {
          bus.emit(data.errorEvent, err);
        }
      );
    }
    else {
      bus.emit(data.errorEvent, new Error('FBS is offline'));
    }
  });

  /**
   * Listen to block patron requests.
   */
  bus.on('fbs.block', function (data) {
    if (onlineState.online) {
      FBS.create(bus).then(function (fbs) {
        fbs.block(data.username, data.reason).then(function (res) {
            bus.emit(data.busEvent, {
              timestamp: new Date().getTime(),
              result: res
            });
          },
          function (err) {
            bus.emit(data.errorEvent, err);
          });
        },
        function (err) {
          bus.emit(data.errorEvent, err);
        }
      );
    }
    else {
      bus.emit(data.errorEvent, new Error('FBS is offline'));
    }
  });

  // Create FBS object to use in tests.
  FBS.create(bus).then(function (fbs) {
    register(null, {
      fbs: fbs
    });
  }, function (err) {
    if (err instanceof Error) {
      err = err.toString();
    }
    bus.emit('logger.err', {'type': 'FBS', 'message': err});
    register(null, {
      fbs: null
    });
  });
};
