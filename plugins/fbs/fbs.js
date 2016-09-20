/**
 * @file
 * Handles communication with FBS through SIP2.
 */

var FBS = function FBS(bus) {
  "use strict";

  var self = this;
  self.bus = bus;

  bus.on('config.fbs.res', function fbsConfig(data) {
    self.username = data.username;
    self.password = data.password;
    self.endpoint = data.endpoint;

    self.send();
  });
  bus.emit('config.fbs', 'config.fbs.res');
};

FBS.prototype.send = function send() {
  var self = this;
  self.bus.once('fbs.sip2.online', function(online) {
    if (online) {
      console.log('SENDING');
    }
    else {
      /**
       * @TODO: Handle off-line mode for FBS.
       */
      console.log('OFF-LINE');
    }
  });
  self.bus.emit('network.online', {
    'url': self.endpoint,
    'callback': 'fbs.sip2.online'
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {


	var fbs = new FBS(imports.bus);

  register(null, { "fbs": fbs });
};
