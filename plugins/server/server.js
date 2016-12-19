/**
 * @file
 * Provide core http services by using express.
 */

'use strict';

/**
 * Register the plugin.
 *
 * @param {array} options
 *   Options defined in app.js.
 * @param {array} imports
 *   The other plugins available.
 * @param {function} register
 *   Callback function used to register this plugin.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;

  // Load modules required.
  var express = require('express');
  var http = require('http');

  // Start the express app.
  var app = express();

  // Connect middleware extension.
  var bodyParser = require('body-parser');
  var favicon = require('serve-favicon');
  var morgan = require('morgan');

  // Start the http server.
  var server = http.createServer(app);

  // Log express requests.
  app.use(morgan('combined', {
    stream: {
      write: function (message) {
        bus.emit('logger.info', message);
      }
    }
  }));

  // Set express app configuration.
  app.set('port', options.port || 3000);
  app.use(favicon(__dirname + '/../../public/favicon.ico'));
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());

  // Enable route.
  var route = options.route || false;
  if (route) {
    app.use(app.router);
  }

  // Set static path (absolute path in the filesystem).
  if (options.hasOwnProperty('path')) {
    app.use(express.static(options.path));
  }

  // Start the server.
  server.listen(app.get('port'), function () {
    bus.emit('logger.info', 'Server is listening on port ' + app.get('port'));
  });

  // Register exposed function with architect.
  register(null, {
    onDestroy: function (callback) {
      bus.emit('logger.info', 'Server stopped');
      server.close(callback);
    },
    app: app,
    server: server
  });
};
