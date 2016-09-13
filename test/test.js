/**
 * @file
 * Mocha tests.
 *
 * Mocks see http://sinonjs.org/
 */

var supertest = require("supertest");
var should = require("should");
var assert = require('assert');

GLOBAL.server = supertest.agent("http://localhost:3010");

/**
 * Helper to setup to minial app with plugins.
 */
GLOBAL.setupArchitect = function setupArchitect(plugins, config) {
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

/**
 * API endpoint exists.
 */
importTest("API (UI)", './api.js');

/**
 *
 */
importTest("FBS", './fbs.js');
