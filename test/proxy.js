/**
 * @file
 * Unit test setup of proxy plugin.
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
        "packagePath": "./../plugins/bus"
      },
      {
        "packagePath": "./../plugins/server",
        "port": 3011,
        "path": path.join(__dirname, 'public')
      },
      {
        "packagePath": "./../plugins/proxy",
        "whitelistedBusEvents": [
          "^bus.event1$",
          "^bus.event2$",
          "^bus.event3$"
        ],
        "whitelistedSocketEvents": [
          "^proxy.event1$",
          "^proxy.event2$",
          "^proxy.event3$"
        ]
      }
    ];

    app = setupArchitect(plugins, config);
  }

  return app;
};

// Tests that the events defined in setup have been registered
it('Proxy event should return a bus event', function (done) {
  // Track if bus.event2 has been fired.
  var eventFired = 0;

  // Call this when the desired event has finished.
  var finish = function () {
    // Make sure the event has only been fired once.
    assert.equal(eventFired, 1, 'bus.event2 should have been fired exactly 1 time, ' + eventFired + ' times detected.');

    // Finish test.
    done();
  };

  setup().then(function (app) {
    // Setup event listener for bus, that reacts to a proxy.event2 with a bus.event2 event.
    app.services.bus.on('proxy.event2', function () {
      app.services.bus.emit('bus.event2', {'msg': 'test'});
    });

    // Setup a socket.io client
    var io = require('socket.io-client');
    var socketURL = 'http://127.0.0.1:3011';
    var options = {
      transports: ['websocket'],
      'force new connection': true
    };

    // Connect the socket client.
    var client1 = io.connect(socketURL, options);

    // Register events.
    client1.on('connect', function (data) {
      client1.on('bus.event2', function (data) {
        assert.equal(data.msg, 'test', 'data.msg should equal "test"');

        eventFired++;
      });

      // Emit the proxy.event2, that should result in a bus.event2 event for the socket client.
      client1.emit('proxy.event2');
    });
  });

  // Wait 1.5 second to make sure the events have fired.
  setTimeout(finish, 1500);
});

it('Should unregister previous bus events, if new connection', function (done) {
  // Track if bus.event2 has been fired.
  var eventFired = 0;

  // Call this when the desired event has finished.
  var finish = function () {
    // Make sure the event has only been fired once.
    assert.equal(eventFired, 1, 'bus.event1 should have been fired exactly 1 time, ' + eventFired + ' times detected.');

    // Finish test.
    done();
  };

  setup().then(function (app) {
    // Setup a socket.io client
    var io = require('socket.io-client');
    var socketURL = 'http://127.0.0.1:3011';
    var options = {
      transports: ['websocket'],
      'force new connection': true
    };

    // Connect the socket client.
    var client1 = io.connect(socketURL, options);

    // Register events.
    client1.on('connect', function () {
      client1.on('bus.event1', function () {
        eventFired++;
      })
    });

    // Wait 1.5 second to make sure the events have fired.
    setTimeout(finish, 1500);
    setTimeout(function () {
      // Setup a socket.io client
      var io = require('socket.io-client');
      var socketURL = 'http://127.0.0.1:3011';
      var options = {
        transports: ['websocket'],
        'force new connection': true
      };

      // Connect the socket client.
      var client2 = io.connect(socketURL, options);

      // Register events.
      client2.on('connect', function () {
        client2.on('bus.event1', function () {
          eventFired++;
        });

        app.services.bus.emit('bus.event1');
      });
    },100);
  });
});


it('Teardown', function(done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
