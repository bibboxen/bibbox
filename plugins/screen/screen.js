/**
 * @file
 * Handles screen trun on/off.
 */

'use strict';

const ScreenCronJob = require('cron').CronJob;
const debug = require('debug')('bibbox:screen');
const uniqid = require('uniqid');
const execProcess = require('child_process').exec;

/**
 * The Screen object.
 *
 * @param {object} bus
 *   The event bus.
 *
 * @constructor
 */
var Screen = function Screen(bus) {
  this.bus = bus;
  this.sceenOnJob = null;
  this.sceenOffJob = null;

  // Load configuration.
  var busEvent = 'screen.config.loaded' + uniqid();
  var errorEvent = 'screen.config.error' + uniqid();

  var self = this;
  bus.once(busEvent, function (config) {
    if (config.hasOwnProperty('screen')) {
      self.setup(config.screen);
    }
  });

  bus.emit('ctrl.config.config', {
    busEvent: busEvent,
    errorEvent: errorEvent
  });
};

Screen.prototype.setup = function setup(config) {
  var self = this;

  // Build time in cron format from configuration format.
  var on = config.on.split(':').reverse().join(' ');
  var off = config.off.split(':').reverse().join(' ');

  // Stop jobs if they are running.
  this.stop();

  // Set new jobs.
  try {
    this.sceenOnJob = new ScreenCronJob(on + ' * * *', function() {
      self.exec('on');
    }, null, false, 'Europe/Copenhagen');

    this.sceenOffJob = new ScreenCronJob(off + ' * * *', function() {
      self.exec('off');
    }, null, false, 'Europe/Copenhagen');
  } catch(e) {
    console.error('Cron', e);
  }

  // Start the jobs.
  this.start();
};

/**
 * Run screen on/off command.
 *
 * @param state
 *   This is string "on" or "off".
 */
Screen.prototype.exec = function exec(state) {
  execProcess('su -c "xset -display :0 dpms force ' + state + '" bibbox', function (err, stdout, stderr) {
    if (err) {
      debug('Screen error: ' + err.message);
      return;
    }
    debug('Screen error: ' +  stderr);
  });
}

/**
 * Start the jobs if they are defined.
 */
Screen.prototype.start = function start() {
  if (this.sceenOnJob != null) {
    this.sceenOnJob.start();
  }
  if (this.sceenOffJob != null) {
    this.sceenOffJob.start();
  }
}

/**
 * Stop the jobs if they are defined.
 */
Screen.prototype.stop = function stop() {
  if (this.sceenOnJob != null) {
    this.sceenOnJob.stop();
  }
  if (this.sceenOffJob != null) {
    this.sceenOffJob.stop();
  }
}

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
