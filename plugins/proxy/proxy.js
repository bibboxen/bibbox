/**
 * @file
 * Proxy
 */

/**
 * This object encapsulates the proxy.
 *
 * @param server
 * @param bus
 *
 * @constructor
 */
var Proxy = function (server, bus, busEvents, proxyEvents) {
  "use strict";

  var io = require('socket.io')(server);

  var registerBusEvent = function registerBusEvent(i, socket) {
    var busEvent = busEvents[i];
    bus.once(busEvent, function (data) {
      console.log("i: " + i + " - " + busEvent);
      socket.emit(busEvent, data);
    });
  };

  var registerProxyEvent = function registerProxyEvent(j, socket) {
    var proxyEvent = proxyEvents[j];
    socket.once(proxyEvent, function (data) {
      console.log("j: " + j + " - " + proxyEvent);
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
      bus.off(busEvent);
    }

    for (var j = 0; j < proxyEvents.length; j++) {
      var proxyEvent = proxyEvents[j];
      socket.off(proxyEvent);
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
