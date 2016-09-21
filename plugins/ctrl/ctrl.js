/**
 * @file
 * Handles communication with the application and provides config.
 */

var allowed = ['127.0.0.1'];

var CTRL = function CTRL(app, bus, allowed) {
  "use strict";

  var self = this;

  self.bus = bus;
  self.allowed = allowed;

  /**
   * Default get request.
   */
  app.get('/ctrl', function (req, res) {
    if (self.checkAccess(req)) {
      res.status(501).send('Please see documentation about using the controller interface.');
    }
    else {
      res.status(401).end();
    }
  });

  /**
   * Reload front end.
   */
  app.get('/ctrl/reload', function (req, res) {
    if (self.checkAccess(req)) {
      bus.emit('frontend.reload');
      res.status(200).end();
    }
    else {
      res.status(401).end();
    }
  });

  /**
   * Handle SIP2 configuration request.
   *
   * @TODO: Load from backend web-service dims.
   */
  bus.on('config.fbs', function sip2config(callback) {
    bus.emit(callback, {
      'username': 'sip2',
      'password': 'password',
      'endpoint': 'https://ET.Cicero-fbs.com/rest/sip2/DK-761500',
      'agency': 'DK-761500'
    });
  });
};

/**
 * Access check based on IP.
 *
 * @param req
 *   The express request.

 * @returns {boolean}
 *   If allowed TRUE else FALSE.
 */
CTRL.prototype.checkAccess = function checkAccess(req) {
  var ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  var ret = this.allowed.indexOf(ip) > -1;

  this.bus.emit('logger.info', 'CTRL: ' + ip + ' requested have accessed to ' + req.url + (ret ? ' (allowed)' : ' (denied)'));

  return ret;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {

  var ctrl = new CTRL(imports.app, imports.bus, options.allowed);

  register(null, { "ctrl": ctrl });
};