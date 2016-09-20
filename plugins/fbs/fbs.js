/**
 * @file
 * Handles communication with FBS through SIP2.
 */

var FBS = function FBS(bus) {
  "use strict";

  var self = this;

  bus.on('config.fbs.res', function fbsConfig(data) {
    self.username = data.username;
    self.password = data.password;
  });
  bus.emit('config.fbs', 'config.fbs.res');
};

FBS.prototype.test = function test() {
	return 42;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {


	var fbs = new FBS(imports.bus);


  register(null, { "fbs": fbs });
};
