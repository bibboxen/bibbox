/**
 * @file
 * Handles communication with the application and provides config.
 */
'use strict';

const Q = require('q');
const uniqid = require('uniqid');

const CTRL = function CTRL(bus) {
  this.bus = bus;
};

/**
 * Get notification configuration.
 *
 * @returns {*|promise}
 */
CTRL.prototype.getConfig = function getConfig() {
  let deferred = Q.defer();
  let busEvent = 'ctrl.config.loaded.config' + uniqid();

  this.bus.once(busEvent, function (data) {
    if (data instanceof Error) {
      deferred.reject(data);
    }
    else {
      deferred.resolve(data);
    }
  });

  this.bus.emit('storage.load', {
    type: 'config',
    name: 'config',
    busEvent: busEvent
  });

  return deferred.promise;
};

/**
 * Get notification configuration.
 *
 * @returns {*|promise}
 */
CTRL.prototype.getFBSConfig = function getFBSConfig() {
  let deferred = Q.defer();
  let busEvent = 'ctrl.fbs.loaded.config' + uniqid();

  this.bus.once(busEvent, function (data) {
    if (data instanceof Error) {
      deferred.reject(data);
    }
    else {
      deferred.resolve(data);
    }
  });

  this.bus.emit('storage.load', {
    type: 'config',
    name: 'fbs',
    busEvent: busEvent
  });

  return deferred.promise;
};

/**
 * Get notification configuration.
 *
 * @returns {*|promise}
 */
CTRL.prototype.getNotificationConfig = function getNotificationConfig() {
  let deferred = Q.defer();
  let busEvent = 'ctrl.notification.loaded.config' + uniqid();

  this.bus.once(busEvent, function (data) {
    if (data instanceof Error) {
      deferred.reject(data);
    }
    else {
      deferred.resolve(data);
    }
  });
  this.bus.emit('storage.load', {
    type: 'config',
    name: 'notification',
    busEvent: busEvent
  });

  return deferred.promise;
};

/**
 * Get the front-end (UI) configuration.
 *
 * NOTE: It uses a promise even though it don't needs to. This is to keep the
 *       code stream lined.
 */
CTRL.prototype.getUiConfig = function getUiConfig() {
  let deferred = Q.defer();
  let busEvent = 'ctrl.loaded.ui.config' + uniqid();

  this.bus.once(busEvent, function (data) {
    if (data instanceof Error) {
      deferred.reject(data);
    }
    else {
      deferred.resolve(data);
    }
  });
  this.bus.emit('storage.load', {
    type: 'config',
    name: 'ui',
    busEvent: busEvent
  });

  return deferred.promise;
};

/**
 * Get all translations for the front-end.
 *
 * @returns {*|promise}
 */
CTRL.prototype.getTranslations = function getTranslations() {
  let deferred = Q.defer();
  let busEvent = 'translations.request.languages' + uniqid();

  this.bus.once(busEvent, function (data) {
    if (data instanceof Error) {
      deferred.reject(data);
    }
    else {
      deferred.resolve(data);
    }
  });
  this.bus.emit('translations.request', {
    busEvent: busEvent
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
  let bus = imports.bus;
  let ctrl = new CTRL(bus);

  /**
   * Handle front-end (UI) configuration requests.
   */
  bus.on('ctrl.config.ui', function (data) {
    ctrl.getUiConfig().then(
      function (res) {
        bus.emit(data.busEvent, res);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      }
    );
  });

  /**
   * Handle front-end (UI) translations requests.
   */
  bus.on('ctrl.config.ui.translations', function (data) {
    ctrl.getTranslations().then(
      function (translations) {
        bus.emit(data.busEvent, {translations: translations});
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      }
    );
  });

  /**
   * Handle notification config requests.
   */
  bus.on('ctrl.config.notification', function (data) {
    ctrl.getNotificationConfig().then(
      function (config) {
        bus.emit(data.busEvent, config);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      }
    );
  });

  /**
   * Handle notification config requests.
   */
  bus.on('ctrl.config.fbs', function (data) {
    ctrl.getFBSConfig().then(
      function (config) {
        bus.emit(data.busEvent, config);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      }
    );
  });

  /**
   * Handle notification config requests.
   */
  bus.on('ctrl.config.config', function (data) {
    ctrl.getConfig().then(
      function (config) {
        bus.emit(data.busEvent, config);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      }
    );
  });

  /**
   * Create bridge to the bus from bootstrap control api.
   *
   * This is done via the process communication with the bootstrap process that
   * has forked this app.
   */
  process.on('message', function (data) {
    switch (data.command) {
      case 'reloadUi':
        bus.emit('frontend.reload');
        break;

      case 'outOfOrder':
        bus.emit('frontend.outOfOrder');
        break;

      case 'config':
        if (data.config.hasOwnProperty('ui')) {
          // Save UI configuration.
          bus.emit('storage.save', {
            type: 'config',
            name: 'ui',
            obj: data.config.ui,
            busEvent: 'storage.config.saved' + uniqid()
          });
        }

        if (data.config.hasOwnProperty('fbs')) {
          // Save fbs config.
          bus.emit('storage.save', {
            type: 'config',
            name: 'fbs',
            obj: data.config.fbs,
            busEvent: 'storage.config.saved' + uniqid()
          });
        }

        if (data.config.hasOwnProperty('notification')) {
          // Save notification config.
          bus.emit('storage.save', {
            type: 'config',
            name: 'notification',
            obj: data.config.notification,
            busEvent: 'storage.config.saved' + uniqid()
          });
        }

        if (data.config.hasOwnProperty('config')) {
          // Save notification config.
          bus.emit('storage.save', {
            type: 'config',
            name: 'config',
            obj: data.config.config,
            busEvent: 'storage.config.saved' + uniqid()
          });
        }
        break;

      case 'translations':
        // Save ui translation strings.
        if (data.translations.hasOwnProperty('ui')) {
          for (let key in data.translations.ui) {
            bus.emit('storage.save', {
              type: 'locales',
              name: 'ui/' + key,
              obj: data.translations.ui[key],
              busEvent: 'storage.translation.ui.saved' + uniqid()
            });
          }
        }

        // Save notification translation strings.
        if (data.translations.hasOwnProperty('notification')) {
          for (let key in data.translations.notification) {
            bus.emit('storage.save', {
              type: 'locales',
              name: 'notifications/' + key,
              obj: data.translations.notification[key],
              busEvent: 'storage.translation.notifications.saved' + uniqid()
            });
          }
        }
        break;

      case 'offlineFailedJobs':
        let busEvent = 'offline.failed.jobs' + uniqid();
        let errorEvent = 'offline.failed.jobs.error' + uniqid();

        bus.once(busEvent, function (data) {
          process.send({
            offlineFailedJobs: data
          });
        });

        bus.once(errorEvent, function (err) {
          process.send({
            offlineFailedJobsError: err.message
          });
        });

        bus.emit('offline.failed.jobs', {
          busEvent: busEvent,
          errorEvent: errorEvent
        });
        break;

      case 'offlineCounts':
        let busEventCounts = 'offline.counts' + uniqid();
        let errorEventCounts = 'offline.counts.error' + uniqid();

        bus.once(busEventCounts, function (data) {
          process.send({
            offlineCounts: data
          });
        });

        bus.once(errorEventCounts, function (err) {
          process.send({
            offlineCountsError: err.message
          });
        });

        bus.emit('offline.counts', {
          busEvent: busEventCounts,
          errorEvent: errorEventCounts
        });
        break;
    }
  });

  register(null, {
    ctrl: ctrl
  });
};
