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
      username: '3210519768',
      password: '12345',
      itemIdentifier: '0000007889',
      busEvent: 'offline.fbs.checkout.success0000007889',
      errorEvent: 'offline.fbs.checkout.error0000007889',
      queued: true
    }).then(function (jobId) {
      try {
        jobId.should.be.a.Number();
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it.only('should add job to offline checkin queue', function (done) {
  setup().then(function (app) {
    app.services.offline.add('checkin', {
      itemIdentifier: '0000007889',
      busEvent: 'offline.fbs.checkin.success0000007889',
      errorEvent: 'offline.fbs.checkin.error0000007889',
      queued: true
    }).then(function (jobId) {
      try {
        jobId.should.be.a.Number();
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
