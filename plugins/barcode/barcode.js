/**
 * @file
 * Defines an event bus to send messages between plugins.
 */

var Barcode = function Barcode() {
  "use strict";

}

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {

	var barcode = new Barcode();


  register(null, null);
};
