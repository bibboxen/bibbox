/**
 * @file
 * Unit test for ctrl plugin.
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
				"packagePath": "./../plugins/server"
			},
			{
				"packagePath": "./../plugins/ctrl"
			}
		];

		app = setupArchitect(plugins, config);
	}

	return app;
};

it('@TODO', function(done) {
	setup().then(function (app) {
		// app.services.fbs.login('1234567890', '12345').then(function (val) {
		// 	try {
		// 		val.should.be.false();
		// 		done();
		// 	}
		// 	catch (err) {
		// 		done(err);
		// 	}
		// }, done);
		done();
	}, done);
});

it('Teardown', function(done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
