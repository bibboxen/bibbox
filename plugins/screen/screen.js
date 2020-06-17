/**
 * @file
 * Checks if the application has online connection.
 */

'use strict';

var ScreenCronJob = require('cron').CronJob;
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

  // Load configuration.
  var busEvent = 'screen.config.loaded' + uniqid();
  var errorEvent = 'screen.config.error' + uniqid();

  console.error('LOADED SCREEN');

  bus.once(busEvent, function (config) {
    if (config.hasOwnProperty('screen')) {
      console.log(config.screen);
      this.setup(config.screen);
    }
  });

  bus.once(errorEvent, function (config) {
    console.error('No config');
  });

  bus.emit('ctrl.config.config', {
    busEvent: busEvent,
    errorEvent: errorEvent
  });
};

Screen.prototype.setup = function setup(config) {

  console.log('HERHE')
  console.log(config);

  // this.sceenOnjob = new ScreenCronJob('* * * * * *', function() {
  //   console.log('You will see this message every second');
  // }, null, true, 'America/Los_Angeles');
  //
  // this.sceenOffjob = new ScreenCronJob('* * * * * *', function() {
  //   console.log('You will see this message every second');
  // }, null, true, 'America/Los_Angeles');
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
   * Handle configuration changes.
   */
  bus.on('storage.saved', function online(data) {
    var busEvent = 'screen.config.loaded' + uniqid();
    var errorEvent = 'screen.config.error' + uniqid();

    bus.once(busEvent, function (config) {
      if (config.hasOwnProperty('screen')) {
        screen.setup(config.screen);
      }
    });

    bus.emit('ctrl.config.config', {
      busEvent: busEvent,
      errorEvent: errorEvent
    });
  });

  register(null, {
    screen: screen
  });
};
