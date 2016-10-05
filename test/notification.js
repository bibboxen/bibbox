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
				"packagePath": "./../plugins/notification"
			}
		];

		app = setupArchitect(plugins, config);
	}

	return app;
};

it('Mail template', function(done) {
	var fs = require('fs');

	setup().then(function (app) {
		var os = require('os');
		var file = os.tmpdir() + '/out.pdf';

		app.services.notification.test(file).then(function () {
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

it('Default printer - exists', function() {
	return setup().then(function (app) {
		var data = app.services.notification.getDefaultPrinterName();
		data.should.be.string();
	});
});

it('Teardown', function(done) {
	setup().then(function (app) {
		app.destroy();
		done();
	}, done);
});
