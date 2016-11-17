/**
 * @file
 * Unit test setup of rfid plugin.
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
        packagePath: './../plugins/bus'
      },
      {
        packagePath: './../plugins/rfid',
        port: 3001,
        afi: {
          on: 194,
          off: 7
        }
      }
    ];

    app = setupArchitect(plugins, config);
  }

  return app;
};

it('Should be able to setup a connection with a WS client', function (done) {
  setup().then(
    function () {
      var WebSocket = require('ws');
      var ws = new WebSocket('ws://localhost:3001', {
        protocolVersion: 13
      });

      ws.on('open', function open() {
        done();
      });
    }
  );
});

it('Teardown', function (done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
