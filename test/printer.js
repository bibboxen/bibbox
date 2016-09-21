/**
 * @file
 * Unit test setup of Printer plugin.
 */

var app = null;
var setup = function setup() {
	if (!app) {
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
				"packagePath": "./../plugins/printer"
			}
		];

		app = setupArchitect(plugins, config);
	}

	return app;
};

it('Test file generation', function(done) {
	var fs = require('fs');

	setup().then(function (app) {
		var os = require('os');
		var file = os.tmpdir() + '/out.pdf';

		app.services.printer.test(file).then(function () {
			try {
				var stats = fs.statSync(file);
				stats.isFile().should.be.true();
				stats.size.should.not.equal(0);
				done();
			}
			catch (err) {
				done(err);
			}
		});
  });
});

it('Teardown', function(done) {
	setup().then(function (app) {
		app.destroy();
		done();
	}, done);
});
