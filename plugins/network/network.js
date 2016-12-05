/**
 * @file
 * Checks if the application has online connection.
 */

'use strict';

var url = require('url');
var Q = require('q');
var fork = require('child_process').fork;
var debug = require('debug')('bibbox:network');


var Network = function Network(bus) {
  this.bus = bus;
};

Network.prototype.isOnline = function isOnline(uri) {
  var deferred = Q.defer();

  try {
    var address = url.parse(uri);
    var port = address.protocol === 'https:' ? 443 : 80;
    var tester = fork(__dirname + '/network_tester.js', [address.host, port, 1000]);

    tester.once('message', function (data) {
      if (data.error) {
        debug('Tester error: ' + data.message);
        deferred.reject(data.message);
      }
      else {
        debug('Tester connected successful (pid: ' + tester.pid + ')');
        deferred.resolve();
      }
    });

    // Debug helper code.
    tester.once('close', function (code) {
      debug('Tester (pid: ' + tester.pid + ') closed with code: ' + code);
    });
    debug('Tester started with pid: ', tester.pid);
  }
  catch (err) {
    deferred.reject(err);
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
