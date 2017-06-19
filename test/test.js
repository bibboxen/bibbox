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
global.isEventExpired = function isEventExpired(timestamp, debug, eventName) {
  var current = new Date().getTime();
  eventName = eventName || 'Unknown';

  var config = require(__dirname + '/config.json');

  if (Number(timestamp) + config.eventTimeout < current) {
    debug('EVENT ' + eventName + ' is expired (' + ((Number(timestamp) + config.eventTimeout) - current) + ').');
    return true;
  }

  debug('EVENT ' + eventName + ' message not expired (' + ((Number(timestamp) + config.eventTimeout) - current) + ').');
  return false;
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
importTest('BarCode', './barcode.js');
importTest('FBS', './fbs.js');
importTest('Notification', './notification.js');
importTest('Proxy', './proxy.js');
importTest('Translation', './translation.js');
importTest('RFID', './rfid.js');
importTest('Controller', './ctrl.js');
importTest('Offline', './offline.js');
