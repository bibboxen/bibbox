/**
 * @file
 * Checks if the application has online connection.
 */

'use strict';

var screenCronJob = require('cron').CronJob;
var fork = require('child_process').fork;
var debug = require('debug')('bibbox:screen');
var uniqid = require('uniqid');

/**
 * The Screen object.
 *
 * @param {object} bus
 *   The event bus.
 *
 * @constructor
 */
var Screen = function Network(bus) {
  this.bus = bus;
};

Screen.prototype.setup = function setup(on, off) {

  this.sceenOnjob = new screenCronJob('* * * * * *', function() {
    console.log('You will see this message every second');
  }, null, true, 'America/Los_Angeles');

  this.sceenOffjob = new screenCronJob('* * * * * *', function() {
    console.log('You will see this message every second');
  }, null, true, 'America/Los_Angeles');
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
  var screen = new Screen(bus);

  /**
   * Check if a given network address is online.
   */
  bus.on('storage.saved', function online(data) {
    var busEvent = 'screen.config.loaded' + uniqid();
    var errorEvent = 'screen.config.error' + uniqid();

    bus.once(busEvent, function (config) {
      deferred.resolve(new FBS(bus, config));
    });

    bus.once(errorEvent, function (err) {
      deferred.reject(err);
    });

    bus.emit('ctrl.config.config', {
      busEvent: busEvent,
      errorEvent: errorEvent
    });
  });

  register(null, {
    network: screen
  });
};
