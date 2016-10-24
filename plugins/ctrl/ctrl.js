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

  /**
   * Handle SIP2 configuration request.
   *
   * @TODO: Load from backend web-service dims.
   */
  bus.on('config.fbs', function sip2config(data) {
    bus.emit(data.busEvent, {
      username: 'TroelsOgJesper',
      password: 'HaveNisse94Molslinjenq',
      endpoint: 'https://Cicero-fbs.com/rest/sip2/DK-675100',
      agency: 'DK-675100',
      location: 'hb'
    });
  });

  /**
   * Handle notification template configuration request.
   *
   * @TODO: Load from backend web-service dims.
   */
  bus.on('config.notification', function libraryConfig(data) {
    bus.emit(data.busEvent, {
      config: {
        default_lang: 'da',
        date_format: 'd/m/y'
      },
      mailer: {
        host: 'smtp.aarhuskommune.local',
        port: 25,
        secure: false,
        from: 'udsender@aakb.dk',
        subject: 'Test mail'
      },
      header: {
        brand: ' data:image/png;base64,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',
        logo: 'data:image/png;base64,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"',
        color: 'f26306'
      },
      library: {
        title: 'Det besøgte bibliotek',
        name: 'Test bibliotek',
        address: 'Testvej 123',
        zipcode: '8000',
        city: 'Aarhus',
        phone: '12344556'
      },
      footer: {
        html: 'Åbningstider: se <a href="https://www.aakb.dk" target="_blank">www.aakb.dk</a>',
        text: 'Åbningstider: se www.aakb.dk'
      },
      layouts: {
        status: {
          fines: true,
          loans: true,
          reservations: true,
          reservations_ready: true,
          pokemon: true
        },
        checkIn: {
          check_ins: true,
          pokemon: true
        },
        checkOut: {
          fines: true,
          loans: false,
          loans_new: true,
          reservations: false,
          reservations_ready: true,
          check_ins: false,
          pokemon: true
        },
        reservations: {
          fines: true,
          loans: false,
          loans_new: false,
          reservations: false,
          reservations_ready: true,
          check_ins: false,
          pokemon: true
        }
      }
    });
  });
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
 * Get the front-end (UI) configuration.
 *
 * NOTE: It uses a promise even though it don't needs to. This is to keep the
 *       code stream lined.
 */
CTRL.prototype.getUiConfig = function getUiConfig() {
  var deferred = Q.defer();

  deferred.resolve({
    features: [
      {
        text: 'menu.borrow',
        require_online: false,
        url: '/#/login/borrow',
        icon: 'glyphicon-tasks'
      },
      {
        text: 'menu.status',
        require_online: true,
        url: '/#/login/status',
        icon: 'glyphicon-refresh'
      },
      {
        text: 'menu.reservations',
        require_online: true,
        url: '/#/login/reservations',
        icon: 'glyphicon-list-alt'
      },
      {
        text: 'menu.return',
        require_online: false,
        url: '/#/return',
        icon: 'glyphicon-time'
      }
    ],
    languages: [
      {
        text: 'language.da',
        langKey: 'da',
        icon: 'img/flags/DK.png'
      },
      {
        text: 'language.en',
        langKey: 'en',
        icon: 'img/flags/GB.png'
      }
    ],
    timeout: {
      idleTimeout: 15,
      idleWarn: 7
    }
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

  register(null, {
    ctrl: ctrl
  });
};
