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
      url: matomoConfig.clientUrl,
      e_c: category,
      e_a: action,
      e_n: name,
      uid: matomoConfig.userId,
      _cvar: JSON.stringify({
        '1': ['location', matomoConfig.location]
      })
    });
  }

  // Config request success event.
  bus.once('matomo.request_config', function (config) {
    if (config.hasOwnProperty('matomo_site_id') && config.hasOwnProperty('matomo_host')) {
      matomoConfig = {
        siteId: config.matomo_site_id,
        host: 'http://' + config.matomo_host + '/piwik.php',
        userId: config.machine_name,
        location: config.location,
        clientUrl: config.matomo_client_url
      };

      matomo = new MatomoTracker(matomoConfig.siteId, matomoConfig.host);

      // Optional: Respond to tracking errors
      matomo.on('error', function(err) {
        console.log(err);
        bus.emit('logger.err', { 'type': 'Matomo', 'message': err });
      });

      bus.on('fbs.online', function () {
        console.log('fbs.online');
        trackEvent('Connection', 'Online', 'FBS');
      });

      bus.on('fbs.offline', function () {
        console.log('fbs.offline');
        trackEvent('Connection', 'Offline', 'FBS');
      });
    }
    else {
      bus.emit('logger.warn', { 'type': 'Matomo', 'message': 'Matomo config not set. Not initialized.' });
    }
  });

  // Config request error event.
  bus.on('matomo.request_config.error', function (err) {
    bus.emit('logger.err', { 'type': 'Matomo', 'message': err });
  });

  // Request the config.
  bus.emit('ctrl.config.config', {
    busEvent: 'matomo.request_config',
    errorEvent: 'matomo.request_config.error'
  });
};
