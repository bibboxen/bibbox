/**
 * @file
 * Bootstrap the application to allow self-updating.
 */

'use strict';

var debug = require('debug')('bibbox:bootstrap');
var fork = require('child_process').fork;
var spawn = require('child_process').spawn;
var UrlParser = require('url');
var queryString = require('querystring');

var config = require(__dirname + '/config.json');
var Q = require('q');

var rfid_debug = process.env.RFID_DEBUG || false;

var Bootstrap = function Bootstrap() {
  var self = this;
  this.bibbox = null;
  this.rfidApp = null;
  this.alive = 0;

  var https = require('https');
  var fs = require('fs');

  var options = {
    key: fs.readFileSync(__dirname + '/' + config.bootstrap.ssl.key),
    cert: fs.readFileSync(__dirname + '/' + config.bootstrap.ssl.cert)
  };

  https.createServer(options, function (req, res) {
    var ip = self.getRemoteIp(req);
    var url = req.url;
    if (config.bootstrap.allowed.indexOf(ip) > -1) {
      debug('Requested url: "' + url + '" from: "' + ip + '" allowed');
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      url = UrlParser.parse(url);

      if (req.method == 'POST') {
        self.parseBody(req).then(function (body) {
          self.handleRequest(req, res, url, body);
        }, function (err) {
          res.write(JSON.stringify({
            error: err
          }));
          res.end();
        });
      }
      else {
        self.handleRequest(req, res, url);
      }
    }
    else {
      debug('Requested url: "' + url + '" from: "' + ip + '" denied');
      res.writeHead(401);
      res.write('Unauthorized');
      res.end();
    }
  }).listen(config.bootstrap.port);

  debug('Https server started at: ' + config.bootstrap.port);
};

// Extend the object with event emitter.
var eventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Bootstrap, eventEmitter);

Bootstrap.prototype.handleRequest = function handleRequest(req, res, url, body) {
  var self = this;

  body = body || false;

  /**
   * Restart NodeJS application.
   */
  switch (url.pathname) {
    case '/restart/application':
      self.restartApp().then(function () {
        res.write(JSON.stringify({
          pid: self.bibbox.pid,
          status: 'running'
        }));
        res.end();

      }, function (err) {
        res.write(JSON.stringify({
          pid: 0,
          status: 'stopped',
          error: err.message
        }));
        res.end();
      });

      break;

    /**
     * Send reload event to the UI.
     */
    case '/restart/ui':
      self.bibbox.send({
        command: 'reloadUi'
      });
      res.write(JSON.stringify({
        status: 'Reload sent',
      }));
      res.end();
      break;

    /**
     * Update based on pull from github.
     *
     * @query version
     *   String with the tag to checkout.
     */
    case '/update/pull':
      var query = JSON.parse(JSON.stringify(queryString.parse(url.query)));
      if (query.hasOwnProperty('version')) {
        self.updateApp(query.version).then(function () {
          self.getVersion().then(function (version) {
            res.write(JSON.stringify({
              version: version
            }));
            res.end();
          }, function (err) {
            res.write(JSON.stringify({
              error: err
            }));
            res.end();
          });
        }, function (err) {
          res.write(JSON.stringify({
            error: err.message
          }));
          res.end();
        });
      }
      else {
        res.write(JSON.stringify({
          error: 'Missing version in query string'
        }));
        res.end();
      }
      break;

    /**
     * Update based on release file.
     *
     * @query url
     *   String with URL to release file on github.
     */
    case '/update/download':
      var query = JSON.parse(JSON.stringify(queryString.parse(url.query)));
      if (query.hasOwnProperty('url')) {

      }
      else {
        res.write(JSON.stringify({
          error: 'Missing file in query string'
        }));
        res.end();
      }
      break;

    /**
     * Send update config to bibbox.
     */
    case '/config':
      self.bibbox.send({
        command: 'config',
        config: body
      });
      res.write(JSON.stringify({
        status: 'Config sent',
      }));
      res.end();
      break;

    /**
     * Send update translations to bibbox.
     */
    case '/translations':
      self.bibbox.send({
        command: 'translations',
        translations: body
      });
      res.write(JSON.stringify({
        status: 'Config sent',
      }));
      res.end();
      break;

    /**
     * Alive (last sean and version).
     */
    case '/alive':
      if (self.bibbox) {
        self.getVersion().then(function (version) {
          res.write(JSON.stringify({
            status: 'running',
            pid: self.bibbox.pid,
            version: version,
            time: Math.round(self.alive / 1000)
          }));
          res.end();
        }, function (err) {
          res.write(JSON.stringify({
            status: 'running',
            pid: self.bibbox.pid,
            version: err,
            time: Math.round(self.alive / 1000)
          }));
          res.end();
        });
      }
      else {
        res.write(JSON.stringify({
          status: 'stopped',
          pid: 0,
          time: Math.round(self.alive / 1000)
        }));
        res.end();
      }
      break;

    default:
      res.write('Hello World!');
      res.end();
      break;
  }
};

/**
 * Parse POST request body.
 *
 * @param req
 *   Request object.
 *
 * @returns {*|promise}
 *   Resolved if parsed else rejected.
 */
Bootstrap.prototype.parseBody = function parseBody(req) {
  var deferred = Q.defer();

  var body = '';

  req.on('data', function (data) {
    body += data;

    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6) {
      req.connection.destroy();
      deferred.reject('Killed');
    }
  });

  req.on('end', function () {
    if (body === '') {
      deferred.resolve();
    }
    else {
      deferred.resolve(JSON.parse(body));
    }
  });

  return deferred.promise;
};

/**
 * Get remote IP.
 *
 * Get the IP of the client.
 *
 * @param req
 *   The http request.
 *
 * @returns {*}
 *   The IP as an string.
 */
Bootstrap.prototype.getRemoteIp = function getRemoteIp(req) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;

  // Take the first ip if this is a proxy list.
  if (ip.indexOf(',') !== -1) {
    ip = ip.split(',').unshift();
  }

  return ip;
};

/**
 * Get the current version.
 *
 * @returns {*|promise}
 *   Resolve with version or reject with git output.
 */
Bootstrap.prototype.getVersion = function getVersion() {
  var deferred = Q.defer();
  var git = spawn('git', ['describe', '--exact-match', '--tags']);

  git.stdout.on('data', function (data) {
    var version = data.toString().replace("\n", '');
    debug('Version: ' + version);
    deferred.resolve(version);
  });

  git.stderr.on('data', function (data) {
    var err = data.toString().replace("\n", '');
    debug('Version error: ' + err);
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Restart the application.
 *
 * @return promise
 *   Resolves if app have been re-started.
 */
Bootstrap.prototype.restartApp = function restartApp() {
  var self = this;
  var deferred = Q.defer();

  debug('Restart called.');

  Q.all([
    self.stopApp(),
    self.startApp()
  ]).then(function () {
    deferred.resolve();
  }).catch(function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Start the application as a child process.
 *
 * @return promise
 *   Resolves if app have been started and the old one closed.
 */
Bootstrap.prototype.startApp = function startApp() {
  var deferred = Q.defer();
  var self = this;

  var app = fork(__dirname + '/app.js');
  debug('Started new application with pid: ' + app.pid);

  // Start RFID java application.
  if (!rfid_debug) {
    this.rfidApp = fork(__dirname + '/start_rfid.sh');
    debug('Started new rfid application with pid: ' + this.rfidApp.pid);
  }

  // Event handler for startup errors.
  function startupError(code) {
    debug('Bibbox not started exit code: ' + app.exitCode);

    deferred.reject(app.exitCode);
  }
  app.once('close', startupError);

  // Listen for "ready" events.
  app.once('message', function (message) {
    if (message.hasOwnProperty('ready')) {
      app.removeListener('close', startupError);

      debug('Bibbox is ready with pid: ' + app.pid);
      self.bibbox = app;
      self.bibbox.on('message', function (message) {
        // React to ping events.
        if (message.hasOwnProperty('ping')) {
          self.alive = message.ping;
        }
      });

      deferred.resolve();
    }
  });

  return deferred.promise;
};

/**
 * Stop the application.
 *
 * @return promise
 *   Resolves if app have been closed.
 */
Bootstrap.prototype.stopApp = function stopApp() {
  var deferred = Q.defer();
  var self = this;

  debug('Stop BibBox');

  this.bibbox.on('error', function (err) {
    debug('Error: ' + err.message);
    deferred.reject(err);
  });

  // Handle close event.
  this.bibbox.on('close', function (code) {
    debug('Stopped application with pid: ' + self.bibbox.pid + ' and exit code: ' + self.bibbox.exitCode);

    deferred.resolve();
  });

  // Handle close event.
  if (this.rfidApp) {
    this.rfidApp.on('close', function (code) {
      debug('Stopped RFID application with pid: ' + self.rfidApp.pid + ' and exit code: ' + self.rfidApp.exitCode);
    });
  }

  if (this.rfidApp) {
    this.rfidApp.kill('SIGTERM');
  }

  // Kill the application.
  this.bibbox.kill('SIGTERM');

  return deferred.promise;
};


/**
 * Pull version form git-hub and restart application.
 *
 * @param version
 *   The version to update to.
 */
Bootstrap.prototype.updateApp = function updateApp(version) {
  var self = this;
  var deferred = Q.defer();

  debug('Update called.');

  // Update from github.com.
  spawn('git', ['fetch']).on('close', function (code) {
    // Checkout version.
    spawn('git', ['checkout', version]).on('close', function (code) {
      // Copy config file.
      spawn('cp', ['example.config.json', 'config.json']).on('close', function (code) {
        // Restart the application.
        self.restartApp().then(function () {
          deferred.resolve();
        }, function (err) {
          deferred.reject(err);
        });
      });
    });
  });

  return deferred.promise;
};

// Get the show on the road.
var bs = new Bootstrap();
bs.startApp();

/**
 * Handle bootstrap process exit and errors.
 *
 * @param options
 * @param err
 */
function exitHandler(options, err) {
  if (err) {
    console.error(err.stack);
  }
  if (options.exit) {
    bs.stopApp();
    process.exit();
  }
}

// Bootstrap app is closing.
process.on('exit', exitHandler.bind(null, {exit: true}));

// Catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// Catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
