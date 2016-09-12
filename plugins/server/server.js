/**
 * @file
 * Provide core http services by using express.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Get connected to the logger
  var logger = imports.logger;

  // Load modules required.
  var express = require('express');
  var http = require('http');

  // Start the express app.
  var app = express();

  // Connect middleware extension.
  var bodyParser = require('body-parser');
  var favicon = require('serve-favicon');
  var morgan = require('morgan')

  // Start the http server.
  var server = http.createServer(app);

  // Log express requests.
  app.use(morgan('combined', {
    "stream": {
      "write": logger.info
    }
  }));

  // Set express app configuration.
  app.set('port', options.port || 3000);
  app.use(favicon(__dirname + '/../../public/favicon.ico'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Enable route.
  var route = options.route || false;
  if (route) {
    app.use(app.router);
  }

  // Set static path (absolute path in the filesystem).
  if (options.path !== undefined) {
    app.use(express.static(options.path));
  }

  // Start the server.
  server.listen(app.get('port'), function () {
    logger.debug('Express server with socket.io is listening on port ' + app.get('port'));
  });

  // Register exposed function with architect.
  register(null, {
    onDestruct: function (callback) {
      server.close(callback);
      logger.debug('Express server stopped');
    },
    app: app,
    server: server
  });
};
