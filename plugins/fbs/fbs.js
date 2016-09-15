/**
 * @file
 * Handles communication with FBS through SIP2.
 */

var FBS = function FBS() {
  "use strict";

}

FBS.prototype.test = function test() {
	return 42;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {

	var fbs = new FBS();


  register(null, { "fbs": fbs });
};
