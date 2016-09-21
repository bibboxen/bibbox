/**
 * @file
 * Unit test setup of FBS plugin.
 */

/**
 * Setup the application plugin for FBS tests.
 */
var setup = function setup() {
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
		},
		{
	    "packagePath": "./../plugins/fbs"
	  }
	];

	return setupArchitect(plugins, config);
};

it('Example test (42)', function(done) {
	this.timeout(10000);
	setup().then(function (app) {
  	app.services.bus.on('fbs.test.status', function (res) {
  		console.log(res);
  		done();
		});
		app.services.bus.on('fbs.offline', function () {
			done(new Error('FBS is offline'));
		});
  	app.services.fbs.status('fbs.test.status');
  });
});
