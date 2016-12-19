/**
 * @file
 * Proxy for forwarding events between frontend (connected through socket.io) and the bus.
 */

'use strict';

var uniqid = require('uniqid');

/**
 * This object encapsulates the proxy.
 *
 * @param {object} server
 *   The Express server.
 * @param {object} bus
 *   The event bus.
 * @param {array} whitelistedBusEvents
 *   The white listed bus events to proxy.
 * @param {array} whitelistedSocketEvents
 *   The white listed socket events to proxy.
 *
 * @param {array} allowed
 *   The allowed origins that the socket will accetp connections.
 *
 * @constructor
 */
var Proxy = function (server, bus, whitelistedBusEvents, whitelistedSocketEvents, allowed) {
  var io = require('socket.io')(server, { origins: allowed });

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
  var busEventHandler = function busEventHandler(event, value) {
    if (currentSocket) {
      // Test for each white list RegExp.
      for (var item in whitelistedBusEvents) {
        if (whitelistedBusEvents.hasOwnProperty(item)) {
          var reg = new RegExp(whitelistedBusEvents[item]);
          if (reg.test(event)) {
            // Check if the message about to be emitted is an error message as
            // this will result in an empty object in the socket connections
            // client.
            if (value instanceof Error) {
              value = {
                type: 'error',
                message: value.message
              };
            }
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
  var socketEventHandler = function socketEventHandler(event) {
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
    var busEvent = 'proxy.config.ui' + uniqid();
    var errorEvent = 'proxy.config.ui.error' + uniqid();
    bus.once(busEvent, function (data) {
      socket.emit('config.ui.update', data);
    });
    bus.once(errorEvent, function (err) {
      socket.emit('config.ui.update.error', err);
    });
    bus.emit('ctrl.config.ui', {
      busEvent: busEvent,
      errorEvent: errorEvent
    });

    // Emit translation to client.
    busEvent = 'proxy.config.ui.translation' + uniqid();
    errorEvent = 'proxy.config.ui.translation.error' + uniqid();
    bus.once(busEvent, function (data) {
      socket.emit('config.ui.translations.update', data);
    });
    bus.once(errorEvent, function (err) {
      socket.emit('config.ui.translations.error', err);
    });
    bus.emit('ctrl.config.ui.translations', {
      busEvent: busEvent,
      errorEvent: errorEvent
    });

    // Handle socket error events.
    socket.on('error', function (err) {
      bus.emit('logger.err', err);
    });
  });
};

/**
 * Register the plugin with architect.
 *
 * @param {array} options
 *   Options defined in app.js.
 * @param {array} imports
 *   The other plugins available.
 * @param {function} register
 *   Callback function used to register this plugin.
 */
module.exports = function (options, imports, register) {
  var proxy = new Proxy(imports.server, imports.bus, options.whitelistedBusEvents, options.whitelistedSocketEvents, options.allowed);

  register(null, {
    proxy: proxy
  });
};
