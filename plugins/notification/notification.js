/**
 * @file
 * Handle PDF generation and printer events..
 */

var printer = require('printer');
var Mark = require('markup-js');

var fs = require('fs');

var Notification = function Notification(bus) {
  "use strict";
  var self = this;
  this.bus = bus;

  bus.once('notification.library', function (data) {
    self.libraryHeader = data;
  });
  bus.emit('config.notification.library', { 'busEvent': 'notification.library'});

  // Load template snippets.
  this.mailTemplate = fs.readFileSync(__dirname + '/templates/receipt.html', 'utf8');
  this.textTemplate = fs.readFileSync(__dirname + '/templates/receipt.txt', 'utf8');

  // Load library header templates
  this.mailLibraryTemplate = fs.readFileSync(__dirname + '/templates/library.html', 'utf8');
  this.textLibraryTemplate = fs.readFileSync(__dirname + '/templates/library.txt', 'utf8');

  // Add data MarkupJS pipe format.
  Mark.pipes.date = this.formatDate;

  // Get default printer name and use that as printer.
  this.defaultPrinterName = printer.getDefaultPrinterName();
};

/**
 * Date formatter.
 *
 * User as MarkupJS pipe function.
 *
 * @param milliseconds
 *   The timestamp to format.
 *
 * @returns {string}
 *   The data formatted.
 */
Notification.prototype.formatDate = function formatDate(milliseconds) {
  var date = new Date(milliseconds);

  // Prefix month with '0';
  var month = ('0' + (date.getMonth() + 1)).slice(-2);

  // Only get latest 2 char of yera.
  var year = ('' + date.getFullYear()).slice(-2);

  return '' + date.getDate() + '/' + month + '/' + year;
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
 * Render library informatino.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @returns {*}
 */
Notification.prototype.renderLibrary = function renderLibrary(html) {
  if (html) {
    return Mark.up(this.mailLibraryTemplate, this.libraryHeader);
  }
  else {
    return Mark.up(this.textLibraryTemplate, this.libraryHeader);
  }
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
  var self = this;

  this.bus.once('notification.statusReceipt', function(data) {
    //console.log(data);
    //console.log('--------------------------------');

    var options = {
      includes: {
        library: self.renderLibrary(mail)
      }
    };

    var result = '';
    if (mail) {
      result = Mark.up(self.mailTemplate, data, options);
    }
    else {
      result = Mark.up(self.textTemplate, data, options);
    }

    console.log('--------------------------------');
    console.log(result);

  });

  this.bus.emit('fbs.patron', {
    'username': username,
    'password': password,
    'busEvent': 'notification.statusReceipt'
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {

	var notification = new Notification(imports.bus);

  notification.statusReceipt('3208100032', '12345', false);

  register(null, {
    "notification": notification
  });
};
