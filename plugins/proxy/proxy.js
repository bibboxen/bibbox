/**
 * @file
 * Proxy for forwarding events between frontend (connected through socket.io) and the bus.
 */

/**
 * This object encapsulates the proxy.
 *
 * @param server
 * @param bus
 * @param whitelistedBusEvents
 * @param whitelistedSocketEvents
 *
 * @constructor
 */
var Proxy = function (server, bus, whitelistedBusEvents, whitelistedSocketEvents) {
  "use strict";

  var io = require('socket.io')(server);

  // Add wildcard support for socket.
  var wildcard = require('socketio-wildcard')();
  io.use(wildcard);

  var currentSocket = null;

  /**
   * Handler for bus events.
   *
   * @param event
   * @param value
   */
  var busEventHandler = function (event, value) {
    var accept = false;

    // Test for each whitelist RegExp
    for (var item in whitelistedBusEvents) {
      if (whitelistedBusEvents.hasOwnProperty(item)) {
        var reg = new RegExp(whitelistedBusEvents[item]);

        if (reg.test(event)) {
          accept = true;
          break;
        }
      }
    }

    // If a socket has been set and the event has been accepted, emit it.
    if (currentSocket && accept) {
      currentSocket.emit(event, value);
    }
  };

  /**
   * Handler for socket events.
   *
   * @param event
   */
  var socketEventHandler = function (event) {
    var accept = false;

    // Test for each whitelist RegExp
    for (var item in whitelistedSocketEvents) {
      if (whitelistedSocketEvents.hasOwnProperty(item)) {
        var reg = new RegExp(whitelistedSocketEvents[item]);

        if (reg.test(event.data[0])) {
          accept = true;
          break;
        }
      }
    }

    if (accept) {
      bus.emit(event.data[0], event.data[1]);
    }
  };

  /**
   * On connect.
   */
  io.on('connection', function (socket) {
    // If a connection has already been set up, remove listeners from previous.
    if (currentSocket) {
      bus.offAny(busEventHandler);
    }

    // Set current socket.
    currentSocket = socket;

    // Register event listener for all bus events.
    bus.onAny(busEventHandler);

    // Register event listener for all socket events.
    socket.on('*', socketEventHandler);
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  var proxy = new Proxy(imports.server, imports.bus, options.whitelistedBusEvents, options.whitelistedSocketEvents);

  register(null, {
    "proxy": proxy
  });
};
