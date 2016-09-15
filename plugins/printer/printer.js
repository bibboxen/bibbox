/**
 * @file
 * Handle PDF generation and printer events..
 */

var wkhtmltopdf = require('wkhtmltopdf');
var fs = require('fs');
var Q = require('q');

var Printer = function Printer() {
  "use strict";

};

Printer.prototype.test = function test() {
  var deferred = Q.defer();

  var stream = fs.createWriteStream('/tmp/out.pdf');
  stream.on('finish', function() {
      deferred.resolve();
  });
  stream.on('error', function() {
    deferred.reject();
  });
  wkhtmltopdf('http://google.com/', { pageSize: 'letter' })
    .pipe(stream);

  return deferred.promise;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {

	var printer = new Printer();

  register(null, {
    "printer": printer
  });
};
