/**
 * @file
 * Handles communication with the application and provides config.
 */
'use strict';

var Q = require('q');
var uniqid = require('uniqid');

var CTRL = function CTRL(bus) {
  this.bus = bus;
};

/**
 * Get notification configuration.
 *
 * @returns {*|promise}
 */
CTRL.prototype.getFBSConfig = function getFBSConfig() {
  var deferred = Q.defer();
  var busEvent = 'ctrl.fbs.loaded.config' + uniqid();

  this.bus.on(busEvent, function (data) {
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
  var deferred = Q.defer();
  var busEvent = 'ctrl.notification.loaded.config' + uniqid();

  this.bus.on(busEvent, function (data) {
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
  var deferred = Q.defer();
  var busEvent = 'ctrl.loaded.ui.config' + uniqid();

  this.bus.on(busEvent, function (data) {
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
  var deferred = Q.defer();
  var busEvent = 'translations.request.languages' + uniqid();

  this.bus.on(busEvent, function (data) {
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
  var bus = imports.bus;
  var ctrl = new CTRL(bus);

  /**
   * Handle front-end (UI) configuration requests.
   */
  bus.on('ctrl.config.ui', function (data) {
    ctrl.getUiConfig().then(
      function (res) {
        bus.emit(data.busEvent, res);
      },
      function (err) {
        bus.emit('logger.err', 'CTRL: ' + err);
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
        bus.emit('logger.err', 'CTRL: ' + err);
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
        bus.emit('logger.err', 'CTRL: ' + err);
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
        bus.emit('logger.err', 'CTRL: ' + err);
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
        break;

      case 'translations':
        // Save ui translation strings.
        if (data.translations.hasOwnProperty('ui')) {
          for (var key in data.translations.ui) {
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
          for (var key in data.translations.notification) {
            bus.emit('storage.save', {
              type: 'locales',
              name: 'notifications/' + key,
              obj: data.translations.notification[key],
              busEvent: 'storage.translation.notifications.saved' + uniqid()
            });
          }
        }
        break;
    }
  });

  register(null, {
    ctrl: ctrl
  });
};
