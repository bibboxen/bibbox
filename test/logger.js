/**
 * @file
 * Unit test setup for logger plugin.
 */

/**
 * Setup the application plugin for logger tests.
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
	  }
	];

	return setupArchitect(plugins, config);
};

it('@TODO', function() {
  return setup().then(function (app) {
  	assert(true);
  },
  function (err) {
  	assert(false);
	});
});
