/**
 * @file
 * Mocha tests.
 *
 * Mocks see http://sinonjs.org/
 */

'use strict';

global.supertest = require('supertest');
global.should = require('should');
global.assert = require('assert');
global.sinon = require('sinon');

global.server = supertest.agent('http://localhost:3010');

/**
 * Helper to setup to minimal app with plugins.
 *
 * @param plugins
 *   Plugins to load.
 * @param config
 *   Configuration to use
 *
 * @return {*|promise}
 *    Promise that's resolved when the app is loaded.
 */
global.setupArchitect = function setupArchitect(plugins, config) {
  var Q = require('q');
  var deferred = Q.defer();

  var architect = require('architect');

  // User the configuration to start the application.
  config = architect.resolveConfig(plugins, __dirname);
  architect.createApp(config, function (err, app) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(app);
    }
  });

  return deferred.promise;
};

/**
 * Wrapper to load test files.
 *
 * @param name
 *   The name of the test group.
 * @param file
 *   The file to require.
 */
function importTest(name, file) {
  describe(name, function () {
    require(file);
  });
}

// Load test cases.
importTest('Bus', './bus.js');
importTest('Storage', './storage.js');
importTest('Logger', './logger.js');
importTest('Network', './network.js');
importTest('API (UI)', './api.js');
importTest('BarCode', './barcode.js');
importTest('FBS', './fbs.js');
importTest('Notification', './notification.js');
importTest('Proxy', './proxy.js');
importTest('Translation', './translation.js');
importTest('RFID', './rfid.js');
importTest('ctrl', './ctrl.js');
