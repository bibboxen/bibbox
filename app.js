#!/usr/bin/env node

/**
 * @file
 * This is the main application that uses architect to build the application
 * base on plugins.
 */

var path = require('path');
var architect = require("architect");

// Load config file.
var config = require(__dirname + '/config.json');

// Configure the plugins.
var plugins = [
  {
    "packagePath": "./plugins/logger",
    "logs": config.logs
  },
  {
    "packagePath": "./plugins/bus"
  },
  {
    "packagePath": "./plugins/server",
    "port": config.port,
    "path": path.join(__dirname, 'public')
  },
  {
    "packagePath": "./plugins/ctrl",
    "allowed": config.allowed
  },
  {
    "packagePath": "./plugins/network"
  },
  {
    "packagePath": "./plugins/api"
  },
  {
    "packagePath": "./plugins/barcode"
  },
  {
    "packagePath": "./plugins/translation",
    "destination": config.translation.destination
  },
  {
    "packagePath": "./plugins/proxy",
    "proxyEvents": config.proxy.proxyEvents,
    "busEvents": config.proxy.busEvents
  },
  {
    "packagePath": "./plugins/fbs"
  },
  {
    "packagePath": "./plugins/printer"
  }
];

// User the configuration to start the application.
config = architect.resolveConfig(plugins, __dirname);
architect.createApp(config, function (err, app) {
  if (err) {
    throw err;
  }
});
