/**
 * @file
 * Handle PDF generation and printer events..
 */

var wkhtmltopdf = require('wkhtmltopdf');
var printer = require('printer');

var fs = require('fs');
var Q = require('q');


var Notification = function Printer() {
  "use strict";

  // Get default printer name and use that as printer.
  this.printerName = printer.getDefaultPrinterName();
};

Notification.prototype.defaultPrinter = function defaultPrinter() {

};

Notification.prototype.test = function test(file) {
  var deferred = Q.defer();

  var stream = fs.createWriteStream(file);
  stream.on('finish', function() {
      deferred.resolve();
  });
  stream.on('error', function() {
    deferred.reject();
  });
  wkhtmltopdf('<h1>Test</h1><p>Hello world</p>', { pageSize: 'letter' })
    .pipe(stream);

  return deferred.promise;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {

	var notification = new Notification();

  register(null, {
    "notification": notification
  });
};
