/**
 * @file
 * Unit test setup of FBS plugin.
 *
 * @TODO: mock FSB?
 */

/**
 * Setup the application plugin for FBS tests.
 */
var app = null;
var setup = function setup() {
	if (!app) {
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
			},
			{
				"packagePath": "./../plugins/server"
			},
			{
				"packagePath": "./../plugins/ctrl"
			},
			{
				"packagePath": "./../plugins/network"
			},
			{
				"packagePath": "./../plugins/fbs"
			}
		];

		app = setupArchitect(plugins, config);
	}

	return app;
};

it('Login (correct)', function(done) {
	setup().then(function (app) {
		app.services.fbs.login('1234567890', '1234').then(function (val) {
			try {
				val.should.be.true();
				done();
			}
			catch (err) {
				done(err);
			}
		}, done);
  }, done);
});

it('Login (correct)', function(done) {
	setup().then(function (app) {
		app.services.fbs.login('1234567890', '12345').then(function (val) {
			try {
				val.should.be.false();
				done();
			}
			catch (err) {
				done(err);
			}
		}, done);
	}, done);
});

it('Library status', function(done) {
  setup().then(function (app) {
    app.services.fbs.libraryStatus().then(function (res) {
      try {
        res.error.should.equal('');
        res.institutionId.should.equal('DK-761500');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});

it('Patron information', function(done) {
  setup().then(function (app) {
    app.services.fbs.patronInformation('3208100032', '12345').then(function (res) {
      try {
        res.institutionId.should.equal('DK-761500');
        res.patronIdentifier.should.equal('LN:3208100032');
        done();
      }
      catch (err) {
        done(err);
      }
    }, done);
  }, done);
});