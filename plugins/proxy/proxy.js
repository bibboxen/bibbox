/**
 * @file
 * Proxy
 */

/**
 * This object encapsulates the proxy.
 *
 * @param app
 * @param server
 * @param bus
 *
 * @constructor
 */
var Proxy = function (app, server, bus) {
  "use strict";

  var io = require('socket.io')(server);

  var busEvents = ['barcode.data'];
  var socketEvents = ['barcode.start', 'barcode.stop'];

  io.on('connection', function (socket) {

    for (var i = 0; i < busEvents.length; i++) {
      var busEvent = busEvents[i];
      bus.on(busEvent, function (data) {
        socket.emit(busEvent, data);
      });
    }

    for (var j = 0; j < socketEvents.length; j++) {
      var socketEvent = socketEvents[j];
      socket.on(socketEvent, function (data) {
        bus.emit(socketEvent, data);
      });
    }
  });
};


/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  var proxy = new Proxy(imports.app, imports.server, imports.bus);

  register(null, {
    "proxy": proxy
  });
};
