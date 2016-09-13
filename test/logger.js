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

it('Test info event (@TODO: validate)', function() {
  return setup().then(function (app) {
  	app.services.bus.emit('logger.info', 'Info message');
  	assert(true);
  });
});

it('Test debug event (@TODO: validate)', function() {
	return setup().then(function (app) {
		app.services.bus.emit('logger.info', 'Debug message');
		assert(true);
	});
});

it('Test error event (@TODO: validate)', function() {
	return setup().then(function (app) {
		app.services.bus.emit('logger.info', 'Error message');
		assert(true);
	});
});


