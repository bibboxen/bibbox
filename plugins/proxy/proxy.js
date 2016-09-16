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

  io.on('connection', function (socket) {
    for (var i = 0; i < busEvents.length; i++) {
      var busEvent = busEvents[i];
      bus.on(busEvent, function (data) {
        socket.emit(busEvent, data);
      });
    }

    for (var j = 0; j < proxyEvents.length; j++) {
      var proxyEvent = proxyEvents[j];
      socket.on(proxyEvent, function (data) {
        bus.emit(proxyEvent, data);
      });
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
