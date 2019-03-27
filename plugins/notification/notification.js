/**
 * @file
 * Handle PDF generation and printer events..
 */

'use strict';

var twig = require('twig');
var nodemailer = require('nodemailer');
var i18n = require('i18n');
var wkhtmltopdf = require('wkhtmltopdf');
var spawn = require('child_process').spawn;
var uniqid = require('uniqid');
var Q = require('q');
var fs = require('fs');

var debug = require('debug')('bibbox:notification');

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

  // Extend twig with a better sort method.
  twig.extendFilter('sortOnField', function (items, param) {
    var field = param.shift();

    return items.sort(function (a, b) {
      if (a[field] < b[field]) {
        return -1;
      }
      if (a[field] > b[field]) {
        return 1;
      }

      return 0;
    });
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
  this.printLoansNewOfflineTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/loans_new_offline.html', 'utf8')
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
  this.printCheckInOfflineTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/checkin_offline.html', 'utf8')
  });
  // Load footer templates.
  this.mailFooterTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/mail/footer.html', 'utf8')
  });
  this.printFooterTemplate = twig.twig({
    data: fs.readFileSync(__dirname + '/templates/print/footer.html', 'utf8')
  });
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
  var busEvent = 'notification.loaded.config' + uniqid();
  var errorEvent = 'notification.error.config' + uniqid();

  bus.once(busEvent, function (config) {
    deferred.resolve(new Notification(bus, config, paths, languages));
  });

  bus.once(errorEvent, function (err) {
    deferred.reject(err);
  });

  bus.emit('ctrl.config.notification', {
    busEvent: busEvent,
    errorEvent: errorEvent
  });

  return deferred.promise;
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
  var ret = '';

  if (fines.length) {
    // Calculate the correct fine total amount.
    var total = 0.0;
    for (var i in fines) {
      total += parseFloat(fines[i].fineAmount);
    }

    if (html) {
      ret = this.mailFinesTemplate.render({
        items: fines,
        total: total
      });
    }
    else {
      ret = this.printFinesTemplate.render({
        items: fines,
        total: total
      });
    }
  }

  return ret;
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
  var ret = '';

  // Merge information about overdue loans into loans objects.
  overdue.map(function (overdueLoan) {
    loans.find(function (obj) {
      if (obj.id === overdueLoan.id) {
        obj.overdue = true;
      }
    });
  });

  if (loans.length) {
    if (html) {
      ret = this.mailLoansTemplate.render({
        headline: headline,
        items: loans
      });
    }
    else {
      ret = this.printLoansTemplate.render({
        headline: headline,
        items: loans
      });
    }
  }

  return ret;
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
  var ret = '';

  if (items.length) {
    if (html) {
      ret = this.mailLoansNewTemplate.render({
        headline: headline,
        items: items
      });
    }
    else {
      ret = this.printLoansNewTemplate.render({
        headline: headline,
        items: items
      });
    }
  }

  return ret;
};

/**
 * Render new loans list in offline mode.
 *
 * @param items
 *   The new loan items.
 *
 * @returns {*}
 */
Notification.prototype.renderNewLoansOffline = function renderNewLoansOffline(items) {
  var ret = '';

  if (items.length) {
    ret = this.printLoansNewOfflineTemplate.render({
      items: items
    });
  }

  return ret;
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
  var ret = '';

  if (reservations.length) {
    if (html) {
      ret = this.mailReservationsReadyTemplate.render({
        items: reservations
      });
    }
    else {
      ret = this.printReservationsReadyTemplate.render({
        items: reservations
      });
    }
  }

  return ret;
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
  var ret = '';

  if (reservations.length) {
    if (html) {
      ret = this.mailReservationsTemplate.render({
        items: reservations
      });
    }
    else {
      ret = this.printReservationsTemplate.render({
        items: reservations
      });
    }
  }

  return ret;
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
  var ret = '';

  if (items.length) {
    if (html) {
      ret = this.mailCheckInTemplate.render({
        items: items
      });
    }
    else {
      ret = this.printCheckInTemplate.render({
        items: items
      });
    }
  }

  return ret;
};

/**
 * Render checked in offline items.
 *
 * @param items
 *   Returned items.
 *
 * @returns {*}
 */
Notification.prototype.renderCheckInOffline = function renderCheckInOffline(items) {
  var ret = '';

  if (items.length) {
    ret = this.printCheckInOfflineTemplate.render({
      items: items
    });
  }

  return ret;
};


/**
 * Render footer.
 *
 * @param html
 *   If TRUE HTML is outputted else clean text.
 * @returns {*}
 */
Notification.prototype.renderFooter = function renderFooter(html) {
  var ret = '';

  if (html) {
    ret = this.mailFooterTemplate.render({
      content: this.footer.html
    });
  }
  else {
    ret = this.printFooterTemplate.render({
      text: this.footer.text
    });
  }

  return ret;
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

  // Build outer context.
  var context = {
    header: self.headerConfig,
    library: self.renderLibrary(mail),
    footer: self.renderFooter(mail),
    patrons: []
  };

  // Make an copy of the object and remove it from the data structure as the
  // receipt builder loops over the items.
  var patronsInformation = items.patronsInformation;
  delete items.patronsInformation;

  var content;
  for (var patronIdentifier in patronsInformation) {
    var patronInformation = patronsInformation[patronIdentifier];
    if (patronInformation) {
      content = {
        patronIdentifier: patronIdentifier,
        name: patronInformation.hasOwnProperty('personalName') ? patronInformation.personalName : 'Unknown',
        fines: layout.fines ? self.renderFines(mail, patronInformation.fineItems) : '',
        loans: layout.loans ? self.renderLoans(mail, 'receipt.loans.headline', patronInformation.chargedItems, patronInformation.overdueItems) : '',
        reservations: layout.reservations ? self.renderReservations(mail, patronInformation.unavailableHoldItems) : '',
        reservations_ready: layout.reservations_ready ? self.renderReadyReservations(mail, patronInformation.holdItems) : '',
        check_ins: layout.check_ins ? self.renderCheckIn(mail, items[patronInformation.patronIdentifier]) : ''
      };

      // Needs to make a copy to ensure that the content is not changed in the
      // next loop (object ref.).
      context.patrons.push(JSON.parse(JSON.stringify(content)));
    }
    else {
      // Unknown patrons (item was not checkout before check-in etc.).
      content = {
        name: 'Unknown user',
        check_ins: layout.check_ins ? self.renderCheckIn(mail, items['unknown']) : ''
      };

      // Needs to make a copy to ensure that the content is not changed in the
      // next loop (object ref.).
      context.patrons.push(JSON.parse(JSON.stringify(content)));
    }
  }

  // Render receipt.
  var result = '';
  if (mail) {
    // The context is optimized for print receipt, so we need to change it to
    // send a mail to each patron and not one big to one mail patron.
    var patrons = JSON.parse(JSON.stringify(context.patrons));
    context.patrons = [];

    for (var i in patrons) {
      var patron = patrons[i];

      // Copy made as to ensure that the reader process don't change the context
      // object as it's used for every mail sent.
      var data = JSON.parse(JSON.stringify(context));
      data.patrons.push(patron);

      result = self.mailTemplate.render(data);

      // Remove empty lines (from template engine if statements).
      result = result.replace(/(\r\n|\r|\n){2,}/g, '$1\n');

      self.sendMail(patronsInformation[patron.patronIdentifier].emailAddress, result).then(function success() {
        deferred.resolve();
      }, function error(err) {
        deferred.reject(err);
      });
    }
  }
  else {
    result = self.printTemplate.render(context);

    // Remove empty lines (from template engine if statements).
    result = result.replace(/(\r\n|\r|\n){2,}/g, '$1\n');

    // Print it.
    self.printReceipt(result).then(function () {
      deferred.resolve();
    }, function (err) {
      deferred.reject(err);
    });
  }

  return deferred.promise;
};

/**
 * Check in receipt (return items) in offline mode.
 *
 * @param items
 *   The newly checked in items.
 * @param lang
 *   The language code the receipt language.
 *
 * @return {*|promise}
 *   Resolved or error message on failure.
 */
Notification.prototype.checkInOfflineReceipt = function checkInOfflineReceipt(items, lang) {
  var self = this;
  var deferred = Q.defer();

  // Set current language.
  i18n.setLocale(lang ? lang : self.config.default_lang);

  // Build outer context.
  var context = {
    header: self.headerConfig,
    library: self.renderLibrary(false),
    footer: self.renderFooter(false),
    patrons: [{
      name: 'Unknown user',
      check_ins: self.renderCheckInOffline(items['unknown'])
    }]
  };

  // Render receipt.
  var result = self.printTemplate.render(context);

  // Remove empty lines (from template engine if statements).
  result = result.replace(/(\r\n|\r|\n){2,}/g, '$1\n');

  // Print it.
  self.printReceipt(result).then(function () {
    deferred.resolve();
  }, function (err) {
    deferred.reject(err);
  });

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

  self.getPatronInformation(username, password).then(function (data) {
    var patron = data.patron;
    var context = {
      header: self.headerConfig,
      library: self.renderLibrary(mail),
      footer: self.renderFooter(mail),
      patrons: [{
        name: patron.hasOwnProperty('personalName') ? patron.personalName : 'Unknown',
        fines: layout.fines ? self.renderFines(mail, patron.fineItems) : '',
        loans_new: layout.loans_new ? self.renderNewLoans(mail, 'receipt.loans.new.headline', items) : '',
        loans: layout.loans ? self.renderLoans(mail, 'receipt.loans.headline', patron.chargedItems, patron.overdueItems) : '',
        reservations: layout.reservations ? self.renderReservations(mail, patron.unavailableHoldItems) : '',
        reservations_ready: layout.reservations_ready ? self.renderReadyReservations(mail, patron.holdItems) : ''
      }]
    };

    var result = '';
    if (mail) {
      if (patron.hasOwnProperty('emailAddress') && patron.emailAddress !== undefined) {
        result = self.mailTemplate.render(context);

        // Remove empty lines (from template engine if statements).
        result = result.replace(/(\r\n|\r|\n){2,}/g, '$1\n');

        self.sendMail(patron.emailAddress, result).then(function success() {
          deferred.resolve();
        }, function error(err) {
          deferred.reject(err);
        });
      }
      else {
        deferred.reject(new Error('No mail address'));
      }
    }
    else {
      result = self.printTemplate.render(context);

      // Print it.
      self.printReceipt(result).then(function () {
        deferred.resolve();
      }, function (err) {
        deferred.reject(err);
      });
    }
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Check out receipt (loan items) offline mode.
 *
 * @param items
 *   The newly checked out item.
 * @param lang
 *   The language code the receipt language.
 *
 * @return {*|promise}
 *   Resolved or error message on failure.
 */
Notification.prototype.checkOutOfflineReceipt = function checkOutOfflineReceipt(items, lang) {
  var self = this;
  var deferred = Q.defer();

  // Set current language.
  i18n.setLocale(lang ? lang : self.config.default_lang);

  // Build outer context.
  var context = {
    header: self.headerConfig,
    library: self.renderLibrary(false),
    footer: self.renderFooter(false),
    patrons: [{
      name: 'Unknown user',
      loans_new: self.renderNewLoansOffline(items)
    }]
  };

  var result = self.printTemplate.render(context);

  // Print it.
  self.printReceipt(result).then(function () {
    deferred.resolve();
  }, function (err) {
    deferred.reject(err);
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
  this.getPatronInformation(username, password).then(function (data) {
    var patron = data.patron;
    var context = {
      header: self.headerConfig,
      library: self.renderLibrary(mail),
      footer: self.renderFooter(mail),
      patrons: [{
        name: patron.hasOwnProperty('personalName') ? patron.personalName : 'Unknown',
        fines: layout.fines ? self.renderFines(mail, patron.fineItems) : '',
        loans: layout.loans ? self.renderLoans(mail, 'receipt.loans.headline', patron.chargedItems, patron.overdueItems) : '',
        reservations: layout.reservations ? self.renderReservations(mail, patron.unavailableHoldItems) : '',
        reservations_ready: layout.reservations_ready ? self.renderReadyReservations(mail, patron.holdItems) : ''
      }]
    };

    // Add username to receipt.
    if (patron.hasOwnProperty('personalName') && patron.personalName !== '') {
      context.username = patron.personalName;
    }

    var result = '';
    if (mail) {
      if (patron.hasOwnProperty('emailAddress') && patron.emailAddress !== undefined) {
        result = self.mailTemplate.render(context);

        self.sendMail(patron.emailAddress, result).then(function success() {
          deferred.resolve();
        }, function error(err) {
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
      self.printReceipt(result).then(function () {
        deferred.resolve();
      }, function (err) {
        deferred.reject(err);
      });
    }
  }, function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

/**
 * Get an patrons information from FBS.
 *
 * @param username
 *   The ID of the patron to fetch.
 * @param password
 *   Optional: the patrons password.
 *
 * @returns {*|promise}
 *   Resolves with the patrons information or rejected with error object.
 */
Notification.prototype.getPatronInformation = function getPatronInformation(username, password) {
  var deferred = Q.defer();
  var self = this;
  var busEvent = 'notification.getPatronInformation' + username;
  var errorEvent = 'notification.getPatronInformation.error' + username;

  // Check if password was given (defaults to empty string as this still will
  // give use the users information).
  password = password || '';

  // Clean the id.
  if (username.indexOf(':') !== -1) {
    username = username.split(":")[1];
  }

  this.bus.once(busEvent, function (data) {
    if (data.patron.validPatron === 'N') {
      deferred.reject(new Error('Unknown patron'));
    }
    else {
      deferred.resolve(data);
    }

    // Remove the not needed error event listener.
    self.bus.removeAllListeners(errorEvent);
  });

  this.bus.once(errorEvent, function (err) {
    deferred.reject(err);

    // Remove the not needed event listener.
    self.bus.removeAllListeners(busEvent);
  });

  // Request the data to use in the notification.
  this.bus.emit('fbs.patron', {
    timestamp: new Date().getTime(),
    username: username,
    password: password,
    busEvent: busEvent,
    errorEvent: errorEvent
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
      self.bus.emit('logger.err', { 'type': 'notification', 'message': error });
      deferred.reject(error);
    }
    else {
      self.bus.emit('logger.info', { 'type': 'notification', 'message': 'Mail sent to: ' + to });
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
  var deferred = Q.defer();
  var filename = '/tmp/out.pdf';

  var writableStream = fs.createWriteStream(filename);
  var readableStream = wkhtmltopdf(content, {
    'margin-left': 0,
    'margin-right': 0,
    'margin-top': 0,
    'margin-bottom': 10,
    'page-width': 75,
    'page-height': 100000
  });

  readableStream.on('data', function (chunk) {
    writableStream.write(chunk);
  });

  readableStream.on('end', function () {
    var lp = spawn('/usr/bin/lp', [ '-o', 'media=Custom.8x500cm', filename ]);

    lp.stderr.on('data', function (data) {
      deferred.reject(data.toString());
    });

    lp.on('close', function (code) {
      deferred.resolve(code);
    });
  });

  return deferred.promise;
};

/**
 * Get mail addresses for patrons.
 *
 * @param {array} patronIdentifiers
 *   The patrons identifications numbers.
 */
Notification.prototype.getPatronsInformation = function getPatronsInformation(patronIdentifiers) {
  var deferred = Q.defer();

  // Build promise with patron information.
  var patrons = [];
  for (var index in patronIdentifiers) {
    var promise = this.getPatronInformation(patronIdentifiers[index]);
    patrons.push(promise);
  }

  Q.allSettled(patrons).then(function (results) {
    var patronsInformation = {};
    results.forEach(function (result) {
      if (result.state === 'fulfilled') {
        var patron = result.value.patron;

        // Check if patron has an mail address and it's set. If not set the mail
        // to false. This will indicates that the user exists but don't have an
        // mail.
        patronsInformation[patron.patronIdentifier] = patron;
        if (!patron.hasOwnProperty('emailAddress') || patron.emailAddress === undefined) {
          patronsInformation[patron.patronIdentifier]['emailAddress'] = false;
        }
      }
      else {
        // User lookup failed.
        patronsInformation['unknown'] = false;
      }
    });

    deferred.resolve(patronsInformation);
  });

  return deferred.promise;
};

/**
 * Register the plugin with architect.
 *
 * @param {array} options
 *   Options defined in app.js.
 * @param {array} imports
 *   The other plugins available.
 * @param {function} register
 *   Callback function used to register this plugin.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;

  // Create FBS object to use in tests.
  Notification.create(bus, options.paths, options.languages).then(function (notification) {
    register(null, {
      notification: notification
    });
  }, function (err) {
    bus.emit('logger.err', { 'type': 'notification', 'message': err });
    register(null, {
      notification: null
    });
  });

  /**
   * Listen status receipt events.
   */
  bus.on('notification.status', function (data) {
    if (!options.isEventExpired(data.timestamp, debug, 'notification.status')) {
      Notification.create(bus, options.paths, options.languages).then(function (notification) {
        notification.patronReceipt('status', data.mail, data.username, data.password, data.lang).then(function () {
          bus.emit(data.busEvent, {
            timestamp: new Date().getTime(),
            status: true
          });
        }, function (err) {
          bus.emit(data.errorEvent, err);
        });
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
  });

  /**
   * Listen status receipt events.
   */
  bus.on('notification.reservations', function (data) {
    if (!options.isEventExpired(data.timestamp, debug, 'notification.reservations')) {
      Notification.create(bus, options.paths, options.languages).then(function (notification) {
        notification.patronReceipt('reservations', data.mail, data.username, data.password, data.lang).then(function () {
          bus.emit(data.busEvent, {
            timestamp: new Date().getTime(),
            status: true
          });
        }, function (err) {
          bus.emit(data.errorEvent, err);
        });
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
  });

  /**
   * Listen check-out (loans) receipt events.
   */
  bus.on('notification.checkOut', function (data) {
    if (!options.isEventExpired(data.timestamp, debug, 'notification.checkOut')) {
      Notification.create(bus, options.paths, options.languages).then(function (notification) {
        notification.checkOutReceipt(data.mail, data.items, data.username, data.password, data.lang).then(function () {
            bus.emit(data.busEvent, {
              timestamp: new Date().getTime(),
              status: true
            });
          },
          function (err) {
            bus.emit(data.errorEvent, err);
          });
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
  });

  /**
   * Listen check-out offline (loans) receipt events.
   */
  bus.on('notification.checkOutOffline', function (data) {
    if (!options.isEventExpired(data.timestamp, debug, 'notification.checkOutOffline')) {
      Notification.create(bus, options.paths, options.languages).then(function (notification) {
        notification.checkOutOfflineReceipt(data.items, data.lang).then(function () {
            bus.emit(data.busEvent, {
              timestamp: new Date().getTime(),
              status: true
            });
          },
          function (err) {
            bus.emit(data.errorEvent, err);
          });
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
  });

  /**
   * Listen check-in (returns) receipt events.
   */
  bus.on('notification.checkIn', function (data) {
    if (!options.isEventExpired(data.timestamp, debug, 'notification.checkIn')) {
      Notification.create(bus, options.paths, options.languages).then(function (notification) {
        notification.checkInReceipt(data.mail, data.items, data.lang).then(function () {
          bus.emit(data.busEvent, {
            timestamp: new Date().getTime(),
            status: true
          });
        }, function (err) {
          bus.emit(data.errorEvent, err);
        });
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
  });

  /**
   * Listen check-in offline (returns) receipt events.
   */
  bus.on('notification.checkInOffline', function (data) {
    if (!options.isEventExpired(data.timestamp, debug, 'notification.checkInOffline')) {
      Notification.create(bus, options.paths, options.languages).then(function (notification) {
        notification.checkInOfflineReceipt(data.items, data.lang).then(function () {
          bus.emit(data.busEvent, {
            timestamp: new Date().getTime(),
            status: true
          });
        }, function (err) {
          bus.emit(data.errorEvent, err);
        });
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
  });

  /**
   * Listen getMailAddresses receipt events.
   */
  bus.on('notification.getPatronsInformation', function (data) {
    if (!options.isEventExpired(data.timestamp, debug, 'notification.getPatronsInformation')) {
      Notification.create(bus, options.paths, options.languages).then(function (notification) {
        notification.getPatronsInformation(data.patronIdentifiers).then(function (patrons) {
          bus.emit(data.busEvent, {
            timestamp: new Date().getTime(),
            patrons: patrons
          });
        }, function (err) {
          bus.emit(data.errorEvent, err);
        });
      }, function (err) {
        bus.emit(data.errorEvent, err);
      });
    }
  });
};
