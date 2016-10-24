/**
 * @file
 * Unit test setup of Printer plugin.
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
      },
      {
        packagePath: './../plugins/ctrl'
      },
      {
        packagePath: './../plugins/notification'
      }
    ];

    app = setupArchitect(plugins, config);
  }

  return app;
};

it('Render library header (HTML)', function () {
  return setup().then(function (app) {
    // Override the settings from the ctrl.
    app.services.notification.libraryHeader = {
      title: 'Det besøgte bibliotek',
      name: 'Test bibliotek',
      address: 'Testvej 123',
      zipcode: '8000',
      city: 'Aarhus',
      phone: '12344556'
    };

    var html = app.services.notification.renderLibrary(true);
    var matches = html.match(/(Testvej 123)/);
    matches.should.have.length(2);
    matches.should.be.Array();
    matches.should.containDeep(['Testvej 123']);

    matches = html.match(/(Det besøgte bibliotek)/);
    matches.should.have.length(2);
    matches.should.be.Array();
    matches.should.containDeep(['Det besøgte bibliotek']);
  });
});

/**
 * @TODO: When testing the receipt functions override sendMail() to store
 *        rendered content into a file. That can be checked.
 */

it('Teardown', function (done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
