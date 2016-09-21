/**
 * @file
 * Unit test for network plugin.
 *
 * @TODO: mock FSB?
 */

var app = null;
var setup = function setup() {
	if (!app) {
		var path = require('path');

		// Load config file.
		var config = require(__dirname + '/../config.json');

		// Configure the plugins.
		var plugins = [
			{
				"packagePath": "./../plugins/logger",
				"logs": config.logs
			},
			{
				"packagePath": "./../plugins/bus"
			},
			{
				"packagePath": "./../plugins/network"
			}
		];

		app = setupArchitect(plugins, config);
	}

	return app;
};

it('Google online test', function(done) {
	setup().then(function (app) {
		app.services.network.isOnline('https://google.dk').then(function (val) {
			// Promise resolved, so success.
			assert(true);
			done();
		}, done);
	}, done);
});

it('Test non-existing site', function(done) {
	setup().then(function (app) {
		app.services.network.isOnline('https://fbsfisker.dk').then(function (val) {
			// Promise resolved, so success.
			assert(false);
			done();
		},
		function () {
			assert(true);
			done();
		});
	}, done);
});

it('Teardown', function(done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
