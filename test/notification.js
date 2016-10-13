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

// it('Default printer - exists', function() {
// 	return setup().then(function (app) {
// 		var data = app.services.notification.getDefaultPrinterName();
// 		data.should.be.string();
// 	});
// });

it('Teardown', function(done) {
	setup().then(function (app) {
		app.destroy();
		done();
	}, done);
});
