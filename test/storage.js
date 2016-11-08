/**
 * @file
 * Unit test setup of translation plugin.
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
        packagePath: './../plugins/bus'
      },
      {
        packagePath: './../plugins/storage',
        paths: config.paths
      }
    ];

    app = setupArchitect(plugins, config);
  }

  return app;
};

it('Save fictive config file and load it', function (done) {
  setup().then(function (app) {
    app.services.storage.save('config', 'test', { test: 'test' }).then(function () {
      app.services.storage.load('config', 'test').then(function(res) {
        try {
          res.should.be.a.Object();
          res.should.have.property('test');
          res['test'].should.equal('test');

          done();
        }
        catch (err) {
          done(err);
        }
      }, done);
    }, done);
  }, done);
});

it('Save data to offline storage and append more data to it', function (done) {
  setup().then(function (app) {
    app.services.storage.append('offline', 'test', { test1: 'test' }).then(function (res) {
      app.services.storage.append('offline', 'test', { test2: 'test' }).then(function (res) {
        app.services.storage.load('offline', 'test').then(function (data) {
          try {
            data.should.be.a.Array();
            data.should.have.length(2);
            data[0].should.have.property('test1');
            data[0].test1.should.equal('test');
            data[1].should.have.property('test2');
            data[1].test2.should.equal('test');

            done();
          }
          catch (err) {
            done(err);
          }
        }, done);
      }, done);
    }, done);
  }, done);
});

it('Should remove test files from config storage', function (done) {
  setup().then(function (app) {
    app.services.storage.remove('config', 'test').then(function(res) {
      app.services.storage.load('config', 'test').then(function (data) {
        assert(false, 'File should not exists in config storage');
        done();
      }, function (err) {
        // The error should be thrown.
        if (err.code !== 'ENOENT') {
          done(err);
        }
        done()
      });
    }, done);
  }, done);
});

it('Should remove test files from off-line storage', function (done) {
  setup().then(function (app) {
    app.services.storage.remove('offline', 'test').then(function(res) {
      app.services.storage.load('offline', 'test').then(function (data) {
        assert(false, 'File should not exists in off-line storage');
        done();
      }, function (err) {
        // The error should be thrown.
        if (err.code !== 'ENOENT') {
          done(err);
        }
        done()
      });
    }, done);
  }, done);
});

it('Teardown', function (done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
