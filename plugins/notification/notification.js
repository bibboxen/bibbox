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

  bus.once('notification.config', function (data) {
    self.headerConfig = data.header;
    self.libraryHeader = data.library;
    self.footer = data.footer;
  });
  bus.emit('config.notification', { 'busEvent': 'notification.config'});

  // Load template snippets.
  this.mailTemplate = fs.readFileSync(__dirname + '/templates/receipt.html', 'utf8');
  this.textTemplate = fs.readFileSync(__dirname + '/templates/receipt.txt', 'utf8');

  // Load library header templates.
  this.mailLibraryTemplate = fs.readFileSync(__dirname + '/templates/library.html', 'utf8');
  this.textLibraryTemplate = fs.readFileSync(__dirname + '/templates/library.txt', 'utf8');

  // Load fines templates.
  this.mailFinesTemplate = fs.readFileSync(__dirname + '/templates/fines.html', 'utf8');
  this.textFinesTemplate = fs.readFileSync(__dirname + '/templates/fines.txt', 'utf8');

  // Load loans templates.
  this.mailLoansTemplate = fs.readFileSync(__dirname + '/templates/loans.html', 'utf8');
  this.textLoansTemplate = fs.readFileSync(__dirname + '/templates/loans.txt', 'utf8');

  // Load reservations ready templates.
  this.mailReservationsReadyTemplate = fs.readFileSync(__dirname + '/templates/reservations_ready.html', 'utf8');
  this.textReservationsReadyTemplate = fs.readFileSync(__dirname + '/templates/reservations_ready.txt', 'utf8');

  // Load reservations templates.
  this.mailReservationsTemplate = fs.readFileSync(__dirname + '/templates/reservations.html', 'utf8');
  this.textReservationsTemplate = fs.readFileSync(__dirname + '/templates/reservations.txt', 'utf8');

  // Load footer templates.
  this.mailFooterTemplate = fs.readFileSync(__dirname + '/templates/footer.html', 'utf8');
  this.textFooterTemplate = fs.readFileSync(__dirname + '/templates/footer.txt', 'utf8');

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

  // Prefix day with '0';
  var day = ('0' + (date.getDate() + 1)).slice(-2);

  // Only get latest 2 char of year.
  var year = ('' + date.getFullYear()).slice(-2);

  return '' + day + '/' + month + '/' + year;
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
 * Render library information.
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
 * Render fines information.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @param fines
 *   The fine elements to render.
 *
 * @returns {*}
 *
 */
Notification.prototype.renderFines = function renderFines(html, fines) {
  if (html) {
    return Mark.up(this.mailFinesTemplate, { 'items': fines });
  }
  else {
    return Mark.up(this.textFinesTemplate, { 'items': fines });
  }
};

/**
 * Render loans information.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @param title
 *   Section title.
 * @param loans
 *   The fine elements to render.
 *
 * @returns {*}
 */
Notification.prototype.renderLoans = function renderLoans(html, title, loans) {
  if (html) {
    return Mark.up(this.mailLoansTemplate, {
      'title': title,
      'items': loans
    });
  }
  else {
    return Mark.up(this.textLoansTemplate, {
      'title': title,
      'items': loans
    });
  }
};

/**
 * Render reservations ready for pick-up.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @param reservations
 *   The reservation elements to render.
 *
 * @returns {*}
 *
 */
Notification.prototype.renderReadyReservations = function renderReadyReservations(html, reservations) {
  if (html) {
    return Mark.up(this.mailReservationsReadyTemplate, { 'items': reservations });
  }
  else {
    return Mark.up(this.textReservationsReadyTemplate, { 'items': reservations });
  }
};

/**
 * Render reservations for pick-up.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @param reservations
 *   The reservation elements to render.
 *
 * @returns {*}
 *
 */
Notification.prototype.renderReservations = function renderReservations(html, reservations) {
  if (html) {
    return Mark.up(this.mailReservationsTemplate, { 'items': reservations });
  }
  else {
    return Mark.up(this.textReservationsTemplate, { 'items': reservations });
  }
};

/**
 * Render footer.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @returns {*}
 */
Notification.prototype.renderFooter = function renderFooter(html) {
  var self = this;
  // @TODO: Make util library thing for this stuff. HACK ALERT.
  function receiptDate() {
    function zeroPad(number) {
      return ('0' + (number)).slice(-2)
    }
    var d = new Date();
    return '' + zeroPad(d.getDate()) + '/' + zeroPad(d.getMonth() + 1) + '/' + d.getFullYear().toString().slice(-2) + ' ' + zeroPad(d.getHours()) + ':' + zeroPad(d.getMinutes()) + ':' + zeroPad(d.getSeconds());
  }

  if (html) {
    return Mark.up(this.mailFooterTemplate, {
      'html': self.footer.html,
      'date': receiptDate()
    });
  }
  else {
    return Mark.up(this.textFooterTemplate, {
      'text': self.footer.text,
      'date': receiptDate()
    });
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

    var options = {
      includes: {
        library: self.renderLibrary(mail),
        fines: self.renderFines(mail, data.fineItems),
        loans: self.renderLoans(mail, 'Lån', data.chargedItems),
        reservations: self.renderReservations(mail, data.unavailableHoldItems),
        reservations_ready: self.renderReadyReservations(mail, data.holdItems),
        footer: self.renderFooter(mail),
        pokemon: 'true'
      }
    };

    var context = {
      'name': data.homeAddress.Name,
      'header': self.headerConfig
    };

    var result = '';
    if (mail) {
      result = Mark.up(self.mailTemplate, context, options);
    }
    else {
      result = Mark.up(self.textTemplate, context, options);

      // Remove empty lines (from template engine if statements).
      result = result.replace(/(\r\n|\r|\n){2,}/g, '$1\n');
    }

    // @TODO: TEMP FILE SAVE UNTIL MAIL IS READY.
    fs.writeFile(__dirname + "/test.html", result, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
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

  notification.statusReceipt('3208100032', '12345', true);

  register(null, {
    "notification": notification
  });
};
