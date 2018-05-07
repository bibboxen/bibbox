/**
 * @file
 * Matomo.
 */

'use strict';

var MatomoTracker = require('matomo-tracker');

var matomo = null;
var matomoConfig = null;

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
  var onlineStatus = null;

  /**
   * Send a track event to Matomo.
   *
   * @param category The event category.
   * @param action   The event action.
   * @param name     The event name.
   */
  function trackEvent(category, action, name) {
    if (matomoConfig === null) {
      return;
    }

    matomo.track({
      url: matomoConfig.clientAddress,
      e_c: category,
      e_a: action,
      e_n: name,
      uid: matomoConfig.userId,
      _cvar: JSON.stringify({
        '1': ['location', matomoConfig.location]
      })
    });
  }

  /**
   * Track changes in online status.
   * @param status
   */
  function trackOnlineStatus(status) {
    if (onlineStatus !== status) {
      trackEvent('Connection', status, 'FBS');
      onlineStatus = status;
    }
  }

  // Config request success event.
  bus.once('matomo.request_config', function (config) {
    if (config.hasOwnProperty('matomo')) {
      matomoConfig = {
        siteId: config.matomo.site_id,
        endpoint: config.matomo.endpoint,
        userId: config.machine_name,
        location: config.location,
        clientAddress: config.address
      };

      matomo = new MatomoTracker(matomoConfig.siteId, matomoConfig.endpoint);

      // Catch tracking errors
      matomo.on('error', function (err) {
        bus.emit('logger.err', {'type': 'Matomo', 'message': err});
      });

      // Track Online messages.
      bus.on('fbs.online', function () {
        trackOnlineStatus('Online');
      });

      // Track Offline messages.
      bus.on('fbs.offline', function () {
        trackOnlineStatus('Offline');
      });

      // Track FBS action results.
      bus.on('fbs.action.result', function (action, success) {
        trackEvent('FBS', action + ' - ' + (success ? 'Success' : "Failure"), 'Request');
      });
    }
    else {
      bus.emit('logger.warn', {
        'type': 'Matomo',
        'message': 'Matomo config not set. Not initialized.'
      });
    }
  });

  // Config request error event.
  bus.on('matomo.request_config.error', function (err) {
    bus.emit('logger.err', {'type': 'Matomo', 'message': err});
  });

  // Request the config.
  bus.emit('ctrl.config.config', {
    busEvent: 'matomo.request_config',
    errorEvent: 'matomo.request_config.error'
  });

  register(null, {});
};
