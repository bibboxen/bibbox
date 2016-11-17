/**
 * @file
 * Unit test setup for bus plugin.
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
      }
    ];

    app = setupArchitect(plugins, config);
  }

  return app;
};

it('Simple "on" and "emit" event', function () {
  return setup().then(function (app) {
    app.services.bus.on('testEvent', function (data) {
      data.should.have.property('test').which.is.a.String();
    });
    app.services.bus.emit('testEvent', {
      test: 'A string'
    });
  });
});

it('Multi events', function () {
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

it('Should be able to register (onAny) for all events', function () {
  return setup().then(function (app) {
    var callback = sinon.spy();

    app.services.bus.onAny(callback);
    app.services.bus.emit('testEvent1', {});
    app.services.bus.emit('testEvent2', {});
    app.services.bus.emit('testEvent3', {});

    callback.calledOnce.should.be.false();
    callback.callCount.should.equal(3);
  });
});

it('Should be able to unregister (offAny) for all events', function () {
  return setup().then(function (app) {
    var callback = sinon.spy();

    app.services.bus.onAny(callback);
    app.services.bus.offAny(callback);

    app.services.bus.emit('testEvent1', {});
    app.services.bus.emit('testEvent2', {});
    app.services.bus.emit('testEvent3', {});

    callback.callCount.should.equal(0);
  });
});

it('Should be able to unregister (off) for an event', function () {
  return setup().then(function (app) {
    var callback = sinon.spy();

    app.services.bus.on('testEvent1', callback);

    app.services.bus.emit('testEvent1', {});
    app.services.bus.emit('testEvent1', {});

    callback.calledOnce.should.be.false();
    callback.callCount.should.equal(2);

    app.services.bus.off('testEvent1', callback);

    app.services.bus.emit('testEvent1', {});
    app.services.bus.emit('testEvent1', {});

    callback.callCount.should.equal(2);
  });
});

it('Should be able to register and unregister to many events', function () {
  return setup().then(function (app) {
    var callback = sinon.spy();

    app.services.bus.many('testEvent1', 3, callback);

    app.services.bus.emit('testEvent1', {});
    app.services.bus.emit('testEvent1', {});
    app.services.bus.emit('testEvent1', {});
    app.services.bus.emit('testEvent1', {});
    app.services.bus.emit('testEvent1', {});
    app.services.bus.emit('testEvent1', {});

    callback.callCount.should.equal(3);
  });
});

it('Teardown', function (done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
