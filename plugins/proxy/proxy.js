/**
 * @file
 * Proxy
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

  // Event listener handlers. This is to enable removal of event listeners.
  var busEventHandlers = {};

  /**
   * Register bus events.
   *
   * @param i
   * @param socket
   */
  var registerBusEvent = function registerBusEvent(i, socket) {
    var busEvent = busEvents[i];

    busEventHandlers[socket][busEvent] = function (data) {
      socket.emit(busEvent, data);
    };

    bus.on(busEvent, busEventHandlers[socket][busEvent]);
  };

  /**
   * Register proxy events.
   *
   * @param j
   * @param socket
   */
  var registerProxyEvent = function registerProxyEvent(j, socket) {
    var proxyEvent = proxyEvents[j];
    socket.on(proxyEvent, function (data) {
      bus.emit(proxyEvent, data);
    });
  };

  io.on('connection', function (socket) {
    // Make sure busEventHandlers is initialized for socket.
    if (!busEventHandlers[socket]) {
      busEventHandlers[socket] = [];
    }

    // Add all event listeners for bus.
    for (var i = 0; i < busEvents.length; i++) {
      var busEvent = busEvents[i];

      // Cleanup old events listeners.
      if (busEventHandlers[socket][busEvent] && typeof busEventHandlers[socket][busEvent] == 'function') {
        for (var key in busEventHandlers) {
          if (busEventHandlers.hasOwnProperty(key)) {
            bus.removeListener(busEvent, busEventHandlers[key][busEvent]);
          }
        }
      }

      registerBusEvent(i, socket);
    }

    for (var j = 0; j < proxyEvents.length; j++) {
      registerProxyEvent(j, socket);
    }
  });

  io.on('disconnect', function () {
    for (var i = 0; i < busEvents.length; i++) {
      var busEvent = busEvents[i];

      bus.removeListener(busEvent, busEventHandlers[busEvent]);
    }
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
