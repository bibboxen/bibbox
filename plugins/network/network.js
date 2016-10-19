/**
 * @file
 * Checks if the application has online connection.
 */

'use strict';

var connectionTester = require('connection-tester');
var url = require('url');
var Q = require('q');

var Network = function Network(bus) {
  this.bus = bus;
};

Network.prototype.isOnline = function isOnline(uri) {
  var deferred = Q.defer();

  var address = url.parse(uri);
  var port = address.protocol === 'https:' ? 443 : 80;
  var connected = connectionTester.test(address.host, port, 1000);
  if (connected.error !== null) {
    deferred.reject(connected.error);
  }
  else {
    deferred.resolve();
  }

  return deferred.promise;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;
  var network = new Network(bus);

  /**
   * Check if a given network address is online.
   */
  bus.on('network.online', function online(data) {
    network.isOnline(data.url).then(
      function () {
        bus.emit(data.busEvent, true);
      },
      function (err) {
        bus.emit('logger.err', err);
        bus.emit(data.busEvent, false);
      }
    );
  });

  register(null, {
    network: network
  });
};
