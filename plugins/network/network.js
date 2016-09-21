/**
 * @file
 * Checks if the application has online connection.
 */
var connectionTester = require('connection-tester');
var url = require('url');

var Network = function Network(bus) {
  "use strict";

  /**
   * Check if a given network address is online.
   */
  bus.on('network.online', function online(data) {
    var address = url.parse(data.url);
    var port = address.protocol === 'https:' ? 443 : 80;
    var connected = connectionTester.test(address.host, port, 1000);
    if (connected.error !== null) {
      bus.emit('logger.err', connected.error);
      bus.emit(data.busEvent, false);
    }
    else {
      bus.emit(data.busEvent, true);
    }
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var network = new Network(imports.bus);

  register(null, { "network": network });
};
