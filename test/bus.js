/**
 * @file
 * Unit test setup for bus plugin.
 */

var app = null;
var setup = function setup() {
	if (!app) {
		// Load config file.
		var config = require(__dirname + '/../config.json');

		// Configure the plugins.
		var plugins = [
			{
				"packagePath": "./../plugins/bus"
			}
		];

		app = setupArchitect(plugins, config);
	}

	return app;
};

it('Simple "on" and "emit" event', function() {
	return setup().then(function (app) {
		app.services.bus.on('testEvent', function (data) {
			data.should.have.property('test').which.is.a.String();
		});
		app.services.bus.emit('testEvent', { 'test': 'A string' });
	});
});

it("Multi events", function () {
	return setup().then(function (app) {
		var callback = sinon.spy();

		app.services.bus.on('testOnceEvent', callback);
		app.services.bus.emit('testOnceEvent', {});
		app.services.bus.emit('testOnceEvent', {});

		callback.calledOnce.should.be.false();
		callback.callCount.should.equal(2);

	});
});

it('Simple once only event', function () {
	return setup().then(function (app) {
		var callback = sinon.spy();

		app.services.bus.once('testOnceEvent', callback);
		app.services.bus.emit('testOnceEvent', {});
		app.services.bus.emit('testOnceEvent', {});

		assert(callback.calledOnce);
	});
});

it('Teardown', function(done) {
	setup().then(function (app) {
		app.destroy();
		done();
	}, done);
});
