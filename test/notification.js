/**
 * @file
 * Unit test setup of Printer plugin.
 */

'use strict';

var config = require(__dirname + '/config.json');
var app = null;
var setup = function setup() {
  if (!app) {
    // Load config file.
    var config = require(__dirname + '/../config.json');

    // Configure the plugins.
    var plugins = [
      {
        packagePath: './../plugins/logger',
        logs: config.logs,
        isEventExpired: isEventExpired
      },
      {
        packagePath: './../plugins/bus',
        isEventExpired: isEventExpired
      },
      {
        packagePath: './../plugins/storage',
        paths: config.paths,
        isEventExpired: isEventExpired
      },
      {
        packagePath: './../plugins/ctrl',
        isEventExpired: isEventExpired
      },
      {
        packagePath: './../plugins/notification',
        paths: config.paths,
        languages: config.languages,
        isEventExpired: isEventExpired
      },
      {
        packagePath: './../plugins/network',
        isEventExpired: isEventExpired
      },
      {
        packagePath: './../plugins/fbs',
        isEventExpired: isEventExpired
      }
    ];

    app = setupArchitect(plugins, config);
  }

  return app;
};

it('Should render library header in HTML', function () {
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

// @TODO: Test the render functions....

it('Should render HTML status mail in english', function (done) {
  this.timeout(5000);

  setup().then(function (app) {
    app.services.notification.sendMail = function (to, content) {
      try {
        to.should.not.be.empty();
        content.should.not.be.empty();

        var matches = content.match(/(The library visited)/);
        matches.should.have.length(2);
        matches.should.be.Array();
        matches.should.containDeep(['The library visited']);

        done();
      }
      catch (err) {
        done(err);
      }
    };

    // Allow notification configuration to be loaded from storage.
    setTimeout(function () {
      app.services.notification.patronReceipt('status', true, config.username.toString(), config.pin, 'en').then(function () {
        // Don't do anything as the tests are in the mail callback.
        done();
      }, done);
    }, 500);
  }, done);
});

it('Should render HTML status mail in danish', function (done) {
  this.timeout(5000);

  setup().then(function (app) {
    app.services.notification.sendMail = function (to, content) {
      try {
        to.should.not.be.empty();
        content.should.not.be.empty();

        var matches = content.match(/(Det besøgte bibliotek)/);
        matches.should.have.length(2);
        matches.should.be.Array();
        matches.should.containDeep(['Det besøgte bibliotek']);

        done();
      }
      catch (err) {
        done(err);
      }
    };

    // Allow notification configuration to be loaded from storage.
    setTimeout(function () {
      app.services.notification.patronReceipt('status', true, config.username.toString(), config.pin, 'da').then(function () {
        // Don't do anything as the tests are in the mail callback.
        done();
      }, done);
    }, 500);
  }, done);
});

it('Teardown', function (done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
