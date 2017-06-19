/**
 * @file
 * Unit test setup of FBS plugin.
 *
 * @TODO: mock FSB?
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
        packagePath: './../plugins/storage',
        paths: config.paths
      },
      {
        packagePath: './../plugins/server'
      },
      {
        packagePath: './../plugins/ctrl'
      },
      {
        packagePath: './../plugins/network'
      },
      {
        packagePath: './../plugins/fbs'
      },
      {
        packagePath: './../plugins/offline',
        host: config.offline.host,
        port: config.offline.port
      }
    ];
    app = setupArchitect(plugins, config);
  }

  return app;
};

it('should add job to offline checkout queue', function (done) {
  setup().then(function (app) {
    app.services.offline.add('checkout', {
      username: '3210519748',
      password: '12345',
      itemIdentifier: '3274626533',
      busEvent: 'offline.fbs.checkout.success3274626533',
      errorEvent: 'offline.fbs.checkout.error3274626533',
      queued: true
    }).then(function (jobId) {
      try {
        jobId.should.be.a.String();
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('should add job to offline check-in queue', function (done) {
  setup().then(function (app) {
    app.services.offline.add('checkin', {
      itemIdentifier: '3274626533',
      busEvent: 'offline.fbs.checkin.success3274626533',
      errorEvent: 'offline.fbs.checkin.error3274626533',
      queued: true
    }).then(function (jobId) {
      try {
        jobId.should.be.a.String();
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
