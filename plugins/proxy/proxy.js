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

  var registerBusEvent = function registerBusEvent(i, socket) {
    var busEvent = busEvents[i];
    bus.on(busEvent, function (data) {
      socket.emit(busEvent, data);
    });
  };

  var registerProxyEvent = function registerProxyEvent(j, socket) {
    var proxyEvent = proxyEvents[j];
    socket.on(proxyEvent, function (data) {
      bus.emit(proxyEvent, data);
    });
  };

  io.on('connection', function (socket) {
    for (var i = 0; i < busEvents.length; i++) {
      registerBusEvent(i, socket);
    }

    for (var j = 0; j < proxyEvents.length; j++) {
      registerProxyEvent(j, socket);
    }
  });

  io.on('disconnect', function (socket) {
    for (var i = 0; i < busEvents.length; i++) {
      var busEvent = busEvents[i];
      bus.removeListener(busEvent);
    }

    for (var j = 0; j < proxyEvents.length; j++) {
      var proxyEvent = proxyEvents[j];
      socket.removeListener(proxyEvent);
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
