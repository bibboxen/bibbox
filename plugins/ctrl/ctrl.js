/**
 * @file
 * Handles communication with the application and provides config.
 */
'use strict';

var Q = require('q');

var CTRL = function CTRL(bus, allowed) {
  var self = this;

  self.bus = bus;
  self.allowed = allowed;
};

/**
 * Access check based on IP.
 *
 * @param req
 *   The express request.

 * @returns {boolean}
 *   If allowed TRUE else FALSE.
 */
CTRL.prototype.checkAccess = function checkAccess(req) {
  var ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  var ret = this.allowed.indexOf(ip) > -1;

  this.bus.emit('logger.info', 'CTRL: ' + ip + ' requested have accessed to ' + req.url + (ret ? ' (allowed)' : ' (denied)'));

  return ret;
};

/**
 * Get notification configuration.
 *
 * @returns {*|promise}
 */
CTRL.prototype.getFBSConfig = function getFBSConfig() {
  var deferred = Q.defer();

  this.bus.on('ctrl.fbs.loaded.config', function (data) {
    deferred.resolve(data);
  });
  this.bus.emit('storage.load', {
    name: 'fbs',
    busEvent: 'ctrl.fbs.loaded.config'
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

  this.bus.on('ctrl.notification.loaded.config', function (data) {
    deferred.resolve(data);
  });
  this.bus.emit('storage.load', {
    name: 'notification',
    busEvent: 'ctrl.notification.loaded.config'
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

  this.bus.on('ctrl.notification.loaded.ui.config', function (data) {
    deferred.resolve(data);
  });
  this.bus.emit('storage.load', {
    name: 'ui',
    busEvent: 'ctrl.notification.loaded.ui.config'
  });

  return deferred.promise;
};

CTRL.prototype.getTranslations = function getTranslations() {
  var deferred = Q.defer();

  this.bus.on('translations.request.languages', function (data) {
    deferred.resolve(data);
  });
  this.bus.emit('translations.request', {busEvent: 'translations.request.languages'});


  return deferred.promise;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {

  var bus = imports.bus;
  var ctrl = new CTRL(bus, options.allowed);

  /**
   * Handle front-end (UI) configuration requests.
   */
  bus.on('ctrl.config.ui', function (data) {
    ctrl.getUiConfig().then(function (res) {
      bus.emit(data.busEvent, res);
    },
    function (err) {
      bus.emit('logger.err', 'CTRL: ' + err);
      bus.emit(data.busEvent, false);
    });
  });

  /**
   * Handle front-end (UI) translations requests.
   */
  bus.on('ctrl.config.ui.translations', function (data) {
    ctrl.getTranslations().then(function (translations) {
      bus.emit(data.busEvent, {translations: translations});
    },
    function (err) {
      bus.emit('logger.err', 'CTRL: ' + err);
      bus.emit(data.busEvent, false);
    });
  });

  /**
   * Handle notification config requests.
   */
  bus.on('ctrl.config.notification', function (data) {
    ctrl.getNotificationConfig().then(function (config) {
      bus.emit(data.busEvent, config);
    },
    function (err) {
        bus.emit('logger.err', 'CTRL: ' + err);
        bus.emit(data.busEvent, false);
    });
  });

  /**
   * Handle notification config requests.
   */
  bus.on('ctrl.config.fbs', function (data) {
    ctrl.getFBSConfig().then(function (config) {
        bus.emit(data.busEvent, config);
      },
      function (err) {
        bus.emit('logger.err', 'CTRL: ' + err);
        bus.emit(data.busEvent, false);
      });
  });

  register(null, {
    ctrl: ctrl
  });
};
