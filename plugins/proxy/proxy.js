/**
 * @file
 * Proxy for forwarding events between frontend (connected through socket.io) and the bus.
 */

/**
 * This object encapsulates the proxy.
 *
 * @param server
 * @param bus
 * @param busEvents
 * @param proxyEvents
 *
 * @constructor
 */
var Proxy = function (server, bus, busEvents, proxyEvents) {
  "use strict";

  var io = require('socket.io')(server);

  // Add wildcard support for socket.
  var wildcard = require('socketio-wildcard')();
  io.use(wildcard);

  var currentSocket = null;

  var busEventHandler = function (event, value) {
    // @TODO: Filter whitelist.

    if (currentSocket) {
      currentSocket.emit(event, value);
    }
  };

  var socketEventHandler = function (event) {
    // @TODO: Filter whitelist.

    bus.emit(event.data[0], event.data[1]);
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

    // Forward all events from socket to the event bus.
    socket.on('*', socketEventHandler);
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  var proxy = new Proxy(imports.server, imports.bus, options.busEvents, options.proxyEvents);

  register(null, {
    "proxy": proxy
  });
};
