#!/usr/bin/env node

/**
 * @file
 * This is the main application that uses architect to build the application
 * base on plugins.
 */
'use strict';

var path = require('path');
var architect = require('architect');
var debug = require('debug')('bibbox:app');

// Load config file.
var config = require(__dirname + '/config.json');

/**
 * Check if a given event message has expired.
 *
 * @param {int} timestamp
 *   Unit timestamp to compare.
 * @param {function} debug
 *   Debug function used to display debug messages.
 * @param {string} eventName
 *   The name of the event (used for debugging).
 *
 * @returns {boolean}
 *   If expire true else false.
 */
var isEventExpired = function isEventExpired(timestamp, debug, eventName) {
  var current = new Date().getTime();
  eventName = eventName || 'Unknown';

  if (Number(timestamp) + config.eventTimeout < current) {
    debug('EVENT ' + eventName + ' is expired (' + ((Number(timestamp) + config.eventTimeout) - current) + ').');
    return true;
  }

  debug('EVENT ' + eventName + ' message not expired (' + ((Number(timestamp) + config.eventTimeout) - current) + ').');
  return false;
};

// Configure the plugins.
var plugins = [
  {
    packagePath: './plugins/logger',
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/crypt'
  },
  {
    packagePath: './plugins/bus',
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/storage',
    paths: config.paths,
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/ctrl',
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/server',
    port: config.port,
    path: path.join(__dirname, 'public'),
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/barcode',
    pid: config.barcode.pid,
    vid: config.barcode.vid,
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/translation',
    paths: config.paths,
    languages: config.languages,
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/proxy',
    whitelistedSocketEvents: config.proxy.whitelistedSocketEvents,
    whitelistedBusEvents: config.proxy.whitelistedBusEvents,
    allowed: config.allowed,
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/fbs',
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/rfid',
    port: config.rfid.port,
    afi: config.rfid.afi,
    allowed: config.rfid.allowed,
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/notification',
    paths: config.paths,
    languages: config.languages,
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/offline',
    host: config.offline.host,
    port: config.offline.port,
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/matomo',
    isEventExpired: isEventExpired
  },
  {
    packagePath: './plugins/screen',
    isEventExpired: isEventExpired
  }
];

// User the configuration to start the application.
var appConfig = architect.resolveConfig(plugins, __dirname);
architect.createApp(appConfig, function (err, app) {
  if (err) {
    console.error(err.stack);
  }
  else {
    debug('Architect plugins successfully bootstrapped.');
  }
});

process.on('uncaughtException', function (error) {
  console.error(error.stack);
});

// Ensure proper process exit when killed in term.
process.once('SIGINT', function () { process.exit(); });
process.once('SIGTERM', function () { process.exit(); });

// If process is forked from bootstrap send keep-alive events back.
setInterval(function () {
  if (process.send) {
    process.send({
      ping: new Date().getTime()
    });
  }
}, 10000);

// Inform bootstrap that it's ready.
if (process.send) {
  process.send({
    ready: true
  });
}
