/**
 * @file
 * Mocha tests.
 *
 * Mocks see http://sinonjs.org/
 */

global.supertest = require("supertest");
global.should = require("should");
global.assert = require('assert');
global.sinon = require('sinon');

global.server = supertest.agent("http://localhost:3010");

/**
 * Helper to setup to minial app with plugins.
 */
global.setupArchitect = function setupArchitect(plugins, config) {
		var Q = require('q');
		var deferred = Q.defer();

		var architect = require("architect");

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
 */
function importTest(name, path) {
  describe(name, function () {
    require(path);
  });
}

// Load test cases.
importTest("Bus", './bus.js');
importTest("Logger", './logger.js');
importTest("API (UI)", './api.js');
importTest("BarCode", './barcode.js');
importTest("FBS", './fbs.js');
importTest("Printer", './printer.js');
importTest("Proxy", './proxy.js');
importTest("Translation", './translation.js');
