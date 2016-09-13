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
	    "packagePath": "./../plugins/fbs"
	  }
	];

	return setupArchitect(plugins, config);
};

it('Example test (42)', function() {
  return setup().then(function (app) {
  	app.services.fbs.test().should.be.exactly(42).and.be.a.Number();
  },
  function (err) {
  	assert(false);
	});
});
