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
    logs: config.logs
  },
  {
    packagePath: './plugins/bus'
  },
  {
    packagePath: './plugins/storage',
    paths: config.paths
  },
  {
    packagePath: './plugins/server',
    port: config.port,
    path: path.join(__dirname, 'public')
  },
  {
    packagePath: './plugins/ctrl',
    allowed: config.allowed
  },
  {
    packagePath: './plugins/network'
  },
  {
    packagePath: './plugins/barcode',
    pid: config.barcode.pid,
    vid: config.barcode.vid
  },
  {
    packagePath: './plugins/translation',
    paths: config.paths,
    languages: config.languages
  },
  {
    packagePath: './plugins/proxy',
    whitelistedSocketEvents: config.proxy.whitelistedSocketEvents,
    whitelistedBusEvents: config.proxy.whitelistedBusEvents
  },
  {
    packagePath: './plugins/fbs'
  },
  {
    packagePath: './plugins/rfid',
    port: config.rfid.port,
    afi: config.rfid.afi
  },
  {
    packagePath: './plugins/notification',
    paths: config.paths,
    languages: config.languages
  },
  {
    packagePath: './plugins/offline',
    host: config.offline.host,
    port: config.offline.port
  }
];

// User the configuration to start the application.
config = architect.resolveConfig(plugins, __dirname);
architect.createApp(config, function (err, app) {
  if (err) {
    throw err;
  }
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
