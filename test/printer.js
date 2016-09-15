/**
 * @file
 * Unit test setup of Printer plugin.
 */

/**
 * Setup the application plugin for Printer tests.
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
	    "packagePath": "./../plugins/printer"
	  }
	];

	return setupArchitect(plugins, config);
};

it('Test file generation', function(done) {
	var fs = require('fs');

	setup().then(function (app) {
  	app.services.printer.test().then(function () {
			try {
				var stats = fs.statSync('/tmp/out.pdf');
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
