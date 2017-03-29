#!/usr/bin/env node

/**
 * @file
 * This is the main application that uses architect to build the application
 * base on plugins.
 */
'use strict';

var path = require('path');
var architect = require('architect');

// Load config file.
var config = require(__dirname + '/config.json');

// Configure the plugins.
var plugins = [
  {
    packagePath: './plugins/logger',
    logs: config.logs,
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/bus',
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/storage',
    paths: config.paths,
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/server',
    port: config.port,
    path: path.join(__dirname, 'public'),
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/ctrl',
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/network',
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/barcode',
    pid: config.barcode.pid,
    vid: config.barcode.vid,
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/translation',
    paths: config.paths,
    languages: config.languages,
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/proxy',
    whitelistedSocketEvents: config.proxy.whitelistedSocketEvents,
    whitelistedBusEvents: config.proxy.whitelistedBusEvents,
    allowed: config.allowed,
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/fbs',
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/rfid',
    port: config.rfid.port,
    afi: config.rfid.afi,
    allowed: config.rfid.allowed,
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/notification',
    paths: config.paths,
    languages: config.languages,
    eventTimeout: config.eventTimeout
  },
  {
    packagePath: './plugins/offline',
    host: config.offline.host,
    port: config.offline.port,
    eventTimeout: config.eventTimeout
  }
];

// User the configuration to start the application.
config = architect.resolveConfig(plugins, __dirname);
architect.createApp(config, function (err, app) {
  if (err) {
    console.error(err.stack);
  }
});

process.on('uncaughtException', function (error) {
  console.log(error.stack);
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
