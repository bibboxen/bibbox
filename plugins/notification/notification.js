/**
 * @file
 * Handle PDF generation and printer events..
 */

'use strict';

var printer = require('printer');
var twig = require('twig');
var nodemailer = require('nodemailer');
var i18n = require('i18n');
var wkhtmltopdf = require('wkhtmltopdf');

var Q = require('q');
var fs = require('fs');

var Notification = function Notification(bus, config, paths, languages) {
  var self = this;
  this.bus = bus;

  // Set object config variables.
  self.mailConfig = config.mailer;
  self.headerConfig = config.header;
  self.libraryHeader = config.library;
  self.footer = config.footer;
  self.layouts = config.layouts;
  self.config = config.config;

  // Set mails transporter.
  self.mailTransporter = nodemailer.createTransport({
    host: self.mailConfig.host,
    port: self.mailConfig.port,
    secure: self.mailConfig.secure,
    ignoreTLS: !self.mailConfig.secure
  });

  // Configure I18N with supported languages.
  i18n.configure({
    locales: languages.locales,
    defaultLocale: languages.defaultLocale,
    indent: '  ',
    autoReload: true,
    directory: __dirname + '/../../' + paths.base + '/' + paths.translations + '/notifications'
  });

  // Extend twig (templates) with translation filter.
  twig.extendFilter('translate', function (str) {
    return i18n.__(str);
  });

  // Load template snippets.
  this.mailTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/receipt.html', 'utf8')
  });
  this.printTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/receipt.html', 'utf8')
  });

  // Load library header templates.
  this.mailLibraryTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/library.html', 'utf8')
  });
  this.printLibraryTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/library.html', 'utf8')
  });

  // Load fines templates.
  this.mailFinesTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/fines.html', 'utf8')
  });
  this.printFinesTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/fines.html', 'utf8')
  });

  // Load loans templates.
  this.mailLoansTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/loans.html', 'utf8')
  });
  this.printLoansTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/loans.html', 'utf8')
  });

  // Load new loans templates.
  this.mailLoansNewTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/loans_new.html', 'utf8')
  });
  this.printLoansNewTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/loans_new.html', 'utf8')
  });

  // Load reservations ready templates.
  this.mailReservationsReadyTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/reservations_ready.html', 'utf8')
  });
  this.printReservationsReadyTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/reservations_ready.html', 'utf8')
  });

  // Load reservations templates.
  this.mailReservationsTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/reservations.html', 'utf8')
  });
  this.printReservationsTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/reservations.html', 'utf8')
  });

  // Load check-in templates.
  this.mailCheckInTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/checkin.html', 'utf8')
  });
  this.printCheckInTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/checkin.html', 'utf8')
  });

  // Load footer templates.
  this.mailFooterTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/footer.html', 'utf8')
  });
  this.printFooterTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/footer.html', 'utf8')
  });


  // Get default printer name and use that as printer.
  this.defaultPrinterName = printer.getDefaultPrinterName();
};

/**
 * Create new Notification object.
 *
 * Static factory function to create Notification object with loaded config.
 * This pattern used to fix race conditions and to ensure that we have an
 * constructor without side-effects.
 *
 * @param bus
 *   The event bus
 * @param paths
 *   Configuration paths to load default translations.
 * @param languages
 *   The configured languages.
 *
 * @returns {*|promise}
 *   Promise that the Notification object is created with configuration.
 */
Notification.create = function create(bus, paths, languages) {
  var deferred = Q.defer();

  bus.once('notification.loaded.config', function (config) {
    deferred.resolve(new Notification(bus, config, paths, languages))
  });

  bus.on('notification.error.config', function (err) {
    deferred.reject(err)
  });

  bus.emit('ctrl.config.notification', {
    busEvent: 'notification.loaded.config',
    errorEvent: 'notification.error.config'
  });

  return deferred.promise;
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
    return this.mailLibraryTemplate.render(this.libraryHeader);
  }
  else {
    return this.printLibraryTemplate.render(this.libraryHeader);
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
    return this.mailFinesTemplate.render({
      items: fines
    });
  }
  else {
    return this.printFinesTemplate.render({
      items: fines
    });
  }
};

/**
 * Render loans information.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @param headline
 *   Section title.
 * @param loans
 *   The fine elements to render.
 * @param overdue
 *   Loan that is overdue
 *
 * @returns {*}
 */
Notification.prototype.renderLoans = function renderLoans(html, headline, loans, overdue) {
  // Merge information about overdue loans into loans objects.
  overdue.map(function (overdueLoan) {
    loans.find(function (obj) {
      if (obj.id === overdueLoan.id) {
        obj.overdue = true;
      }
    });
  });

  if (html) {
    return this.mailLoansTemplate.render({
      headline: headline,
      items: loans
    });
  }
  else {
    return this.printLoansTemplate.render({
      headline: headline,
      items: loans
    });
  }
};

/**
 * Render new loans list.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @param headline
 *   Section headline.
 * @param items
 *   The new loan items.
 *
 * @returns {*}
 */
Notification.prototype.renderNewLoans = function renderNewLoans(html, headline, items) {
  if (html) {
    return this.mailLoansNewTemplate.render({
      headline: headline,
      items: items
    });
  }
  else {
    return this.printLoansNewTemplate.render({
      headline: headline,
      items: items
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
 */
Notification.prototype.renderReadyReservations = function renderReadyReservations(html, reservations) {
  if (html) {
    return this.mailReservationsReadyTemplate.render({
      items: reservations
    });
  }
  else {
    return this.printReservationsReadyTemplate.render({
      items: reservations
    });
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
    return this.mailReservationsTemplate.render({
      items: reservations
    });
  }
  else {
    return this.printReservationsTemplate.render({
      items: reservations
    });
  }
};

/**
 * Render checked in items.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @param items
 *   Returned items.
 *
 * @returns {*}
 */
Notification.prototype.renderCheckIn = function renderCheckIn(html, items) {
  if (html) {
    return this.mailCheckInTemplate.render({
      items: items
    });
  }
  else {
    return this.printCheckInTemplate.render({
      items: items
    });
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
  if (html) {
    return this.mailFooterTemplate.render({
      content: this.footer.html
    });
  }
  else {
    return this.printFooterTemplate.render({
      text: this.footer.text
    });
  }
};

/**
 * Check in receipt (return items).
 *
 * @param mail
 *   If TRUE send mail else print receipt.
 * @param items
 *   The newly checked in items.
 * @param lang
 *   The language code the receipt language.
 *
 * @return {*|promise}
 *   Resolved or error message on failure.
 */
Notification.prototype.checkInReceipt = function checkInReceipt(mail, items, lang) {
  var self = this;
  var deferred = Q.defer();
  var layout = self.layouts.checkIn;

  // Set current language.
  i18n.setLocale(lang ? lang : self.config.default_lang);

  // Listen for status notification message.
  this.bus.once('notification.patronReceipt', function (data) {
    var context = {
      name: data.hasOwnProperty('homeAddress') ? data.homeAddress.Name : 'Unknown',
      header: self.headerConfig,
      library: self.renderLibrary(mail),
      fines: layout.fines ? self.renderFines(mail, data.fineItems) : '',
      loans: layout.loans ? self.renderLoans(mail, 'receipt.loans.headline', data.chargedItems, data.overdueItems) : '',
      reservations: layout.reservations ? self.renderReservations(mail, data.unavailableHoldItems) : '',
      reservations_ready: layout.reservations_ready ? self.renderReadyReservations(mail, data.holdItems) : '',
      footer: self.renderFooter(mail),
      check_ins: layout.check_ins ? self.renderCheckIn(mail, items) : ''
    };

    var result = '';
    if (mail) {
      if (data.hasOwnProperty('emailAddress') && data.emailAddress !== undefined) {
        result = self.mailTemplate.render(context);

        self.sendMail(data.emailAddress, result).then(function () {
          deferred.resolve();
        }, function (err) {
          deferred.reject(err);
        });
      }
      else {
        deferred.reject(new Error('No mail address'));
      }
    }
    else {
      result = self.printTemplate.render(context);

      // Remove empty lines (from template engine if statements).
      result = result.replace(/(\r\n|\r|\n){2,}/g, '$1\n');

      // Print it.
      self.printReceipt(result);
      deferred.resolve();
    }
  }, function (err) {
    deferred.reject(err);
  });

  // Request the data to use in the notification.
  if (items.length && items[0].hasOwnProperty('patronIdentifier')) {
    this.bus.emit('fbs.patron', {
      username: items[0].patronIdentifier,
      password: '',
      busEvent: 'notification.patronReceipt'
    });
  }
  else {
    deferred.reject(new Error('First return has no patron information'));
  }

  return deferred.promise;
};

/**
 * Check out receipt (loan items).
 *
 * @param mail
 *   If TRUE send mail else print receipt.
 * @param items
 *   The newly checked out item.
 * @param username
 *   Username for the current user.
 * @param password
 *   Password for the current user.
 * @param lang
 *   The language code the receipt language.
 *
 * @return {*|promise}
 *   Resolved or error message on failure.
 */
Notification.prototype.checkOutReceipt = function checkOutReceipt(mail, items, username, password, lang) {
  var self = this;
  var deferred = Q.defer();
  var layout = self.layouts.checkOut;

  // Set current language.
  i18n.setLocale(lang ? lang : self.config.default_lang);

  // Filter out failed loans.
  items.map(function (item, index) {
    if (item.status === 'borrow.error') {
      items.splice(index, 1);
    }
  });

  // Listen for status notification message.
  this.bus.once('notification.patronReceipt', function (data) {
    var context = {
      name: data.hasOwnProperty('homeAddress') ? data.homeAddress.Name : 'Unknown',
      header: self.headerConfig,
      library: self.renderLibrary(mail),
      fines: layout.fines ? self.renderFines(mail, data.fineItems) : '',
      loans_new: layout.loans_new ? self.renderNewLoans(mail, 'receipt.loans.new.headline', items) : '',
      loans: layout.loans ? self.renderLoans(mail, 'receipt.loans.headline', data.chargedItems, data.overdueItems) : '',
      reservations: layout.reservations ? self.renderReservations(mail, data.unavailableHoldItems) : '',
      reservations_ready: layout.reservations_ready ? self.renderReadyReservations(mail, data.holdItems) : '',
      footer: self.renderFooter(mail)
    };

    var result = '';
    if (mail) {
      if (data.hasOwnProperty('emailAddress') && data.emailAddress !== undefined) {
        result = self.mailTemplate.render(context);

        self.sendMail(data.emailAddress, result).then(function () {
          deferred.resolve();
        }, function (err) {
          deferred.reject(err);
        });
      }
      else {
        deferred.reject(new Error('No mail address'));
      }
    }
    else {
      result = self.printTemplate.render(context);

      // Remove empty lines (from template engine if statements).
      result = result.replace(/(\r\n|\r|\n){2,}/g, '$1\n');

      // Print it.
      self.printReceipt(result);
      deferred.resolve();
    }
  }, function (err) {
    deferred.reject(err);
  });

   // Request the data to use in the notification.
   this.bus.emit('fbs.patron', {
     username: username,
     password: password,
     busEvent: 'notification.patronReceipt'
   });

  return deferred.promise;
};

/**
 * Handle default receipts.
 *
 * @param type
 *   The type of receipt ('status', 'reservation').
 * @param mail
 *   If TRUE send mail else print receipt.
 * @param username
 *   Username for the current user.
 * @param password
 *   Password for the current user.
 * @param lang
 *   The language code the receipt language.
 *
 * @return {*|promise}
 *   Resolved or error message on failure.
 */
Notification.prototype.patronReceipt = function patronReceipt(type, mail, username, password, lang) {
  var self = this;
  var deferred = Q.defer();
  var layout = self.layouts[type];

  // Set current language.
  i18n.setLocale(lang ? lang : self.config.default_lang);

  // Listen for status notification message.
  this.bus.once('notification.patronReceipt', function (data) {
    var context = {
      name: data.hasOwnProperty('homeAddress') ? data.homeAddress.Name : 'Unknown',
      header: self.headerConfig,
      library: self.renderLibrary(mail),
      fines: layout.fines ? self.renderFines(mail, data.fineItems) : '',
      loans: layout.loans ? self.renderLoans(mail, 'receipt.loans.headline', data.chargedItems, data.overdueItems) : '',
      reservations: layout.reservations ? self.renderReservations(mail, data.unavailableHoldItems) : '',
      reservations_ready: layout.reservations_ready ? self.renderReadyReservations(mail, data.holdItems) : '',
      footer: self.renderFooter(mail)
    };

    var result = '';
    if (mail) {
      if (data.hasOwnProperty('emailAddress') && data.emailAddress !== undefined) {
        result = self.mailTemplate.render(context);

        self.sendMail(data.emailAddress, result).then(function () {
          deferred.resolve();
        }, function (err) {
          deferred.reject(err);
        });
      }
      else {
        deferred.reject(new Error('No mail address'));
      }
    }
    else {
      result = self.printTemplate.render(context);

      // Remove empty lines (from template engine if statements).
      result = result.replace(/(\r\n|\r|\n){2,}/g, '$1\n');

      // Print it.
      self.printReceipt(result);
      deferred.resolve();
    }
  }, function (err) {
    deferred.reject(err);
  });

  // Request the data to use in the notification.
  this.bus.emit('fbs.patron', {
    username: username,
    password: password,
    busEvent: 'notification.patronReceipt'
  });

  return deferred.promise;
};

/**
 * Send mail notification.
 *
 * @param to
 *   The mail address to send mail to.
 * @param content
 *   The html content to send.
 */
Notification.prototype.sendMail = function sendMail(to, content) {
  var deferred = Q.defer();

  var self = this;
  var mailOptions = {
    from: self.mailConfig.from,
    to: to,
    subject: self.mailConfig.subject,
    html: content
  };

  // Send mail with defined transporter.
  self.mailTransporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      self.bus.emit('logger.err', error);
      deferred.reject(error);
    }
    else {
      self.bus.emit('logger.info', 'Mail sent to: ' + to);
      deferred.resolve();
    }
  });

  return deferred.promise;
};

/**
 * Print receipt.
 *
 * @param content
 */
Notification.prototype.printReceipt = function printReceipt(content) {

  wkhtmltopdf(content, {
    'margin-left': 0,
    'margin-right': 0,
    'margin-top': 10,
    'margin-bottom': 0,
    'page-height': 800,
    'page-width': 70
  }).pipe(fs.createWriteStream('/vagrant/out.pdf'));

};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;
  //var notification = new Notification(bus, options.paths, options.languages);

  // Create FBS object to use in tests.
  Notification.create(bus, options.paths, options.languages).then(function (notification) {
    register(null, {
      notification: notification
    });
  }, function (err) {
    bus.emit('logger.err', err);
    register(null, {
      notification: null
    });
  });

  /**
   * Listen status receipt events.
   */
  bus.on('notification.status', function (data) {
    Notification.create(bus, options.paths, options.languages).then(function (notification) {
      notification.patronReceipt('status', data.mail, data.username, data.password, data.lang).then(function () {
        bus.emit(data.busEvent, true);
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }, function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen status receipt events.
   */
  bus.on('notification.reservations', function (data) {
    Notification.create(bus, options.paths, options.languages).then(function (notification) {
      notification.patronReceipt('reservations', data.mail, data.username, data.password, data.lang).then(function () {
        bus.emit(data.busEvent, true);
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }, function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen check-out (loans) receipt events.
   */
  bus.on('notification.checkOut', function (data) {
    Notification.create(bus, options.paths, options.languages).then(function (notification) {
      notification.checkOutReceipt(data.mail, data.items, data.username, data.password, data.lang).then(function () {
        bus.emit(data.busEvent, true);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      });
    }, function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  /**
   * Listen check-in (returns) receipt events.
   */
  bus.on('notification.checkIn', function (data) {
    Notification.create(bus, options.paths, options.languages).then(function (notification) {
      notification.checkInReceipt(data.mail, data.items, data.lang).then(function () {
        bus.emit(data.busEvent, true);
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }, function (err) {
      bus.emit(data.errorEvent, err);
    });
  });

  Notification.create(bus, options.paths, options.languages).then(function (notification) {
    notification.patronReceipt('status', false, '3210519792', '12345').then(function () {
      console.log('done');
    }, function (err) {
      console.error(err);
    });
  }, function (err) {
    bus.emit(data.errorEvent, err);
  });
};
