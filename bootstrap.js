/**
 * @file
 * Bootstrap the application to allow self-updating.
 */
var debug = require('debug')('bibbox:bootstrap');
var fork = require('child_process').fork;
var spawn = require('child_process').spawn;
var config = require(__dirname + '/config.json');

var Bootstrap = function Bootstrap() {
  var self = this;

  self.bibbox = null;
  self.sockets = {};

  // Create http server which only sends a simple page.
  var app = require('http').createServer(function (req, res) {
    res.writeHead(200);
    res.write('<H1>BibBox ctrl</H1>');
    res.write('<p>Use web-socket for communication with the application.</p>');
    res.end();
  });

  // Connect web-socket to the http server.
  var io = require('socket.io')(app);

  // Listen for connections.
  app.listen(config.ctrl.port);

  io.on('connection', function (socket) {
    self.sockets[socket.id] = socket;

    socket.on('restart', function (data) {
      self.restartApp();
    });

    socket.on('update', function (data) {
      self.updateApp(data);
    });
  });
};

// Extend the object with event emitter.
var eventEmitter = require('events').EventEmitter;
var util = require('util');
util.inherits(Bootstrap, eventEmitter);

/**
 * Restart the application.
 */
Bootstrap.prototype.restartApp = function restartApp() {
  debug('Restart called.');
  this.stopApp();
  this.startApp();
};

/**
 * Start the application as a child process.
 */
Bootstrap.prototype.startApp = function startApp() {
  var self = this;
  var app = fork('app.js');
  debug('Started new application with pid: ' + app.pid);

  // This minor hack is to ensure correct pid information during debug on close.
  if (!self.bibbox) {
    self.bibbox = app;
  }


  app.on('message', function(message) {
    for (var id in self.sockets) {
      var socket = self.sockets[id];
      socket.emit('message', message);
    }
  });

  // Handle close event.
  app.on('close', function (code) {
    // First print info about the closing app.
    debug('Stopped application with pid: ' + self.bibbox.pid + ' and exit code: ' + self.bibbox.exitCode);

    // Switch the internal point to the new one.
    self.bibbox = app;
  });
};

/**
 * Stop the application.
 */
Bootstrap.prototype.stopApp = function stopApp() {
  debug('App stopped.');

  // Kill the application.
  this.bibbox.kill('SIGHUP');
};


/**
 * Pull version form git-hub and restart application.
 *
 * @param version
 *   The version to update to.
 */
Bootstrap.prototype.updateApp = function updateApp(version) {
  debug('Update called.');
  // Update from github.com.
  // @TODO: error handling etc.
  // @TODO: check it's up and fetch then checkout version.
  spawn('git', ['fetch']).on('close', function (code) {
    spawn('git', ['checkout', version]).on('close', function (code) {
      restartApp();
    });
  });
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
  if (err) console.log(err.stack);
  if (options.exit) {
    bs.stopApp();
    process.exit();
  }
}

// Bootstrap app is closing.
process.on('exit', exitHandler.bind(null, {exit:true}));

// Catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

// Catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));