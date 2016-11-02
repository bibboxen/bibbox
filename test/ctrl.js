/**
 * @file
 * Unit test for ctrl plugin.
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
        packagePath: './../plugins/storage',
        paths: config.paths
      },
      {
        packagePath: './../plugins/translation',
        paths: config.paths,
        languages: config.languages
      },
      {
        packagePath: './../plugins/bus'
      },
      {
        packagePath: './../plugins/server'
      },
      {
        packagePath: './../plugins/ctrl'
      }
    ];

    app = setupArchitect(plugins, config);
  }

  return app;
};

it('Should return FBS configuration', function (done) {
  setup().then(function (app) {
    app.services.ctrl.getFBSConfig().then(function (res) {
      try {
        res.should.have.property('username');
        res.should.have.property('password');
        res.should.have.property('endpoint');
        res.should.have.property('agency');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Should return notification configuration', function (done) {
  setup().then(function (app) {
    app.services.ctrl.getNotificationConfig().then(function (res) {
      try {
        res.should.have.property('config');
        res.should.have.property('mailer');
        res.should.have.property('header');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Should return UI configuration', function (done) {
  setup().then(function (app) {
    app.services.ctrl.getUiConfig().then(function (res) {
      try {
        res.should.have.property('features');
        res.should.have.property('languages');
        res.should.have.property('timeout');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Should return UI translations', function (done) {
  setup().then(function (app) {
    app.services.ctrl.getTranslations().then(function (res) {
      try {
        res.should.have.property('da');
        res.should.have.property('en');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Teardown', function (done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
