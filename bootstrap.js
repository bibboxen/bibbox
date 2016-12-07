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

var fs = require('fs');
var https = require('https');

var rfid_debug = process.env.RFID_DEBUG || false;

var shutdown = false;

var Bootstrap = function Bootstrap() {
  var self = this;
  this.bibbox = null;
  this.rfidApp = null;
  this.alive = 0;

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

      // Check if this is a post request, if it is parse the request an wait for
      // the data.
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

/**
 * Handler for the request.
 *
 * This is used after the body have been parsed into JSON, if it was a post
 * request.
 *
 * @param req
 *  HTTP request object.
 * @param res
 *  HTTP response object.
 * @param url
 *   The URL the request came in on.
 * @param body
 *   The body pay-load as JSON, if post request else undefined.
 */
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
        status: 'Reload sent'
      }));
      res.end();
      break;

    /**
     * Send reboot computer.
     */
    case '/reboot':
      spawn('/sbin/reboot');
      res.write(JSON.stringify({
        status: 'Reboot started'
      }));
      res.end();
      break;

    /**
     * Send out of order.
     */
    case '/outoforder':
      self.bibbox.send({
        command: 'outOfOrder'
      });
      res.write(JSON.stringify({
        status: 'Out of order sent.'
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
          res.write(JSON.stringify({
            status: 'Restating the application'
          }));
          res.end();

          // Restart the application to allow supervisor to reboot the
          // application.
          process.exit();
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
        var urlParser = require('url');
        var path = require('path');
        var dest = __dirname + '/../' + path.basename(urlParser.parse(query.url).pathname);

        self.downloadFile(query.url, dest).then(function (file) {
            // Try to detect version from the filename.
            var regEx = /v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?/;
            if (!regEx.test(path.basename(file))) {
              var msg = 'Version not found in filename: ' + path.basename(file);
              debug('Err: ' + msg);
              res.write(JSON.stringify({
                error: msg
              }));
              res.end();
              return;
            }

            var version = regEx.exec(path.basename(file))[0];
            var dir = __dirname.substr(0, __dirname.lastIndexOf('/')) + '/' + version;

            debug('File downloaded to: ' + file);

            // Unpack file
            if (!fs.existsSync(dir)){
              fs.mkdirSync(dir);
            }

            var tar = spawn('tar', ['-zxf', file, '-C', dir]);
            tar.stderr.on('data', function (data) {
              debug('Err unpacking file: ' + data.toString());
              res.write(JSON.stringify({
                error: data.toString()
              }));
              res.end();
              return;
            });

            tar.on('exit', function (code) {
              if (code !== 0) {
                // Not clean exit, so handled in strerr function above.
                return;
              }

              // Update symlink.
              debug('Update symlink.');

              // File unpacked, so clean up.
              fs.unlinkSync(file);

              var target = __dirname;
              target = target.substr(0, target.lastIndexOf('/')) + '/bibbox';

              fs.unlinkSync(target);
              fs.symlink(dir, target, function (err, data) {
                if (err) {
                  res.write(JSON.stringify({
                    error: err.message
                  }));
                  res.end();
                }
                else {
                  // Move files folder with config, translation and offline
                  // backup storage.
                  var src = __dirname + '/files';
                  debug('Copy files from: ' + src + ' to: ' + dir);

                  var cp = spawn('cp', ['-rfp', src, dir]);
                  cp.stderr.on('data', function (data) {
                    debug('Err copying file: ' + data.toString());
                    res.write(JSON.stringify({
                      error: data.toString()
                    }));
                    res.end();
                    return;
                  });

                  cp.on('exit', function (code) {
                    if (code === 0) {
                      res.write(JSON.stringify({
                        status: 'Restating the application'
                      }));
                      res.end();

                      // Restart the application to allow supervisor to reboot the
                      // application. The timeout is to allow the "res" transmission
                      // to be completed before restart.
                      setTimeout(function () {
                        process.exit();
                      }, 500);
                    }
                  });
                }
              });

            });
          },
          function (err) {
            res.write(JSON.stringify({
              status: 'error',
              error: err.message
            }));
            res.end();
          })
      }
      else {
        res.write(JSON.stringify({
          error: 'Missing url in query string'
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
        status: 'Config sent'
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
        status: 'Config sent'
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
 * Down load file over https.
 *
 * @param url
 *   Url to download
 * @param dest
 *   Where to download the file.
 *
 * @returns {*|promise}
 */
Bootstrap.prototype.downloadFile = function downloadFile(url, dest) {
  var deferred = Q.defer();
  var file = fs.createWriteStream(dest);
  var request = require('request');

  file.on('finish', function() {
    file.close();
    deferred.resolve(dest);
  });

  request({
    followAllRedirects: true,
    method: 'get',
    url: url
  }).on('error', function (err) {
    debug('Download error: ' + err.message);
    deferred.reject(err);
  }).pipe(file);

  return deferred.promise;
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
  var env = process.env;
  var git = spawn('git', ['describe', '--exact-match', '--tags'], { env: env });

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
    self.startApp(),
    self.stopRFID(),
    self.startRFID()
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

  if (shutdown) {
    debug('App not started - in shutdown');
    deferred.resolve();
  }
  else {
    var app = fork(__dirname + '/app.js');
    debug('Started new application with pid: ' + app.pid);

    // Event handler for startup errors.
    app.once('close', function startupError(code) {
      debug('Bibbox not started exit code: ' + app.exitCode);

      deferred.reject(app.exitCode);
    });

    // Listen for "ready" events.
    app.once('message', function (message) {
      if (message.hasOwnProperty('ready')) {
        app.removeAllListeners('close');

        debug('Bibbox is ready with pid: ' + app.pid);
        self.bibbox = app;
        self.bibbox.on('message', function (message) {
          // React to ping events.
          if (message.hasOwnProperty('ping')) {
            self.alive = message.ping;
          }
        });

        // Restart node app on error.
        self.bibbox.on('close', startApp);

        deferred.resolve();
      }
    });
  }

  return deferred.promise;
};

/**
 * Start the RFID application as a new process.
 *
 * @return promise
 *   Resolves if stated.
 */
Bootstrap.prototype.startRFID = function startRFID() {
  var deferred = Q.defer();

  if (shutdown) {
    debug('RFID not started - in shutdown');
    deferred.resolve();
  }
  else if (!rfid_debug) {
    var env = process.env;
    env.LD_LIBRARY_PATH = '/opt/feig';
    var app = spawn('java', [ '-jar', __dirname + '/plugins/rfid/device/rfid.jar'], { env: env });
    debug('Started new rfid application with pid: ' + app.pid);

    // Store ref. to the application.
    this.rfidApp = app;

    // Restart rfid app on error.
    this.rfidApp.on('close', startRFID);
  }
  else {
    debug('RFID not started in DEBUG mode.')
  }

  deferred.resolve();

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

  if (this.bibbox) {
    this.bibbox.on('error', function (err) {
      debug('Error: ' + err.message);
      deferred.reject(err);
    });

    // Remove auto-start event.
    this.bibbox.removeAllListeners('close', function () {
      // Listen to new close event.
      self.bibbox.on('close', function (code) {
        debug('Stopped application with pid: ' + self.bibbox.pid + ' and exit code: ' + self.bibbox.exitCode);

        // Free memory.
        self.bibbox = null;

        deferred.resolve();
      });

      // Kill the application.
      this.bibbox.kill('SIGTERM');
    });
  }
  else {
    debug('App not running');
    deferred.resolve('Not running.');
  }

  return deferred.promise;
};

/**
 * Stop the RFID application.
 *
 * @return promise
 *   Resolves if app have been closed.
 */
Bootstrap.prototype.stopRFID = function stopRFID() {
  var deferred = Q.defer();
  var self = this;

  debug('Stop RFID');

  if (this.rfidApp) {
    if (!rfid_debug) {
      // Remove auto-start event.
      this.rfidApp.removeAllListeners('close', function () {
        self.rfidApp.on('close', function (code) {
          debug('Stopped RFID application with pid: ' + self.rfidApp.pid + ' and exit code: ' + self.rfidApp.exitCode);

          // Free memory.
          self.rfidApp = null;

          deferred.resolve();
        });

        self.rfidApp.kill('SIGTERM');
      });
    }
    else {
      debug('RFID not stopped, as we are in DEBUG mode.');
      deferred.resolve();
    }
  }
  else {
    debug("RFID was not running");
    deferred.resolve('Not running.')
  }

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
var bootstrap = new Bootstrap();
bootstrap.startApp();
bootstrap.startRFID();

/**
 * Handle bootstrap process exit and errors.
 *
 * @param options
 * @param err
 */
function exitHandler(options, err) {
  if (!shutdown) {
    shutdown = true;
    if (err) {
      console.error(err.stack);
    }
    if (options.exit) {
      bootstrap.stopRFID();
      bootstrap.stopApp();
      process.exit();
    }
  }
}

// Bootstrap app is closing.
process.once('exit', exitHandler.bind(null, {exit: true}));

// Craches supervisor stop.
process.on('SIGTERM', exitHandler.bind(null, {exit: true}));

// Catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit: true}));

// Catches uncaught exceptions
//process.on('uncaughtException', exitHandler.bind(null, {exit: true}));
