/**
 * @file
 * Unit test setup for logger plugin.
 */

'use strict';

var app = null;
var setup = function setup() {
  if (!app) {
    // Load config file.
    var config = require(__dirname + '/../config.json');

    // Configure the plugins.
    var plugins = [
      {
        packagePath: './../plugins/logger',
        logs: config.logs
      },
      {
        packagePath: './../plugins/bus'
      }
    ];

    app = setupArchitect(plugins, config);
  }

  return app;
};

it('Test info event (@TODO: validate)', function () {
  return setup().then(function (app) {
    app.services.bus.emit('logger.info', 'Info message');
    assert(true);
  });
});

it('Test debug event (@TODO: validate)', function () {
  return setup().then(function (app) {
    app.services.bus.emit('logger.info', 'Debug message');
    assert(true);
  });
});

it('Test error event (@TODO: validate)', function () {
  return setup().then(function (app) {
    app.services.bus.emit('logger.info', 'Error message');
    assert(true);
  });
});

it('Teardown', function (done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
