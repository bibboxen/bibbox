/**
 * @file
 * Handle PDF generation and printer events..
 */

var wkhtmltopdf = require('wkhtmltopdf');
var printer = require('printer');
var handlebars = require('handlebars');
var i18n = require("i18n");

var fs = require('fs');
var Q = require('q');


var Notification = function Printer() {
  "use strict";

  // Get default printer name and use that as printer.
  this.defaultPrinterName = printer.getDefaultPrinterName();

  i18n.configure({
    locales:['en', 'da'],
    directory: __dirname + '/locales'
  });

  // Add translation helper (https://www.npmjs.com/package/i18n).
  // <div>{{translate myVar}}</div>
  Handlebars.registerHelper('translate',
     function(str){
       return (i18n != undefined ? i18n.__(str) : str);
     }
  );
};



/**
 * Get name of the default system printer.
 *
 * @returns string
 *   Name of the printer.
 */
Notification.prototype.getDefaultPrinterName = function getDefaultPrinterName() {
  return this.defaultPrinterName;
};

/**
 * Check out receipt.
 *
 * @param username
 * @param password
 * @param counter
 * @param items
 * @param mail
 *   If TRUE send mail else print receipt.
 */
Notification.prototype.checkOutReceipt = function checkOutReceipt(username, password, counter, items, mail) {

};

/**
 *
 * @param username
 * @param password
 * @param counter
 * @param items
 * @param mail
 */
Notification.prototype.checkInReceipt = function checkInReceipt(username, password, counter, items, mail) {

};

/**
 *
 * @param username
 * @param password
 * @param mail
 */
Notification.prototype.reservationsReceipt = function reservationsReceipt(username, password, mail) {

};

/**
 *
 * @param username
 * @param password
 * @param mail
 */
Notification.prototype.statusReceipt = function statusReceipt(username, password, mail) {

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
