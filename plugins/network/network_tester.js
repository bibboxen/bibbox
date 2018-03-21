/**
 * Helper program to connect to remote host to check network connection.
 */

'use strict';

var net = require('net');

var socket = new net.Socket();
var host = process.argv[2];
var port = parseInt(process.argv[3], 10);

/**
 * Connect to remote host.
 */
var connectTimeout = parseInt(process.argv[4], 10);
socket.setTimeout(connectTimeout);
socket.connect(port, host);

/**
 * Connected to remote host.
 */
socket.on('connect', function () {
  socket.destroy();
  process.send({
    error: false
  });
});

/**
 * Connection error.
 */
socket.on('error', function (err) {
  var msg = err && err.message || 'connect ECONNREFUSED';
  socket.destroy();
  process.send({
    error: true,
    message: msg
  });
});

/**
 * Connection timed out.
 */
socket.on('timeout', function (err) {
  socket.destroy();
  process.send({
    error: true,
    message: 'Timed-out: ' + connectTimeout
  });

  // As the process will hang until the OS times out the socket... this program
  // will not exit before that. So we force that exit with a ctrl+c.
  process.kill(process.pid, 'SIGINT');
});
