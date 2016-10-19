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
   * If a socket has been set and the event has been accepted, emit it.
   *
   * @param event
   * @param value
   */
  var busEventHandler = function (event, value) {
    if (currentSocket) {
      // Test for each white list RegExp
      for (var item in whitelistedBusEvents) {
        if (whitelistedBusEvents.hasOwnProperty(item)) {
          var reg = new RegExp(whitelistedBusEvents[item]);
          if (reg.test(event)) {
            currentSocket.emit(event, value);
            break;
          }
        }
      }
    }
  };

  /**
   * Handler for socket events.
   *
   * @param event
   */
  var socketEventHandler = function (event) {
    // Test for each white list RegExp.
    for (var item in whitelistedSocketEvents) {
      if (whitelistedSocketEvents.hasOwnProperty(item)) {
        var reg = new RegExp(whitelistedSocketEvents[item]);

        if (reg.test(event.data[0])) {
          bus.emit(event.data[0], event.data[1]);
          break;
        }
      }
    }
  };

  /**
   * Listen to new socket connections.
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

    // Emit configuration to client.
    bus.once('proxy.config.ui', function (data) {
      socket.emit('config.ui.update', data);
    });
    bus.emit('ctrl.config.ui', { 'busEvent': 'proxy.config.ui' });

    // Emit translation to client.
    bus.once('proxy.config.ui.translation', function (data) {
      socket.emit('config.ui.translations.update', data);
    });
    bus.emit('ctrl.config.ui.translations', { 'lang': 'da', 'busEvent': 'proxy.config.ui.translation' });

    // Handle socket error events.
    socket.on('error', function (err) {
      bus.emit('logger.err', err);

      // @TODO: Handle! How?
      console.log(err);
    });
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  var proxy = new Proxy(imports.server, imports.bus, options.whitelistedBusEvents, options.whitelistedSocketEvents);

  register(null, { "proxy": proxy });
};
