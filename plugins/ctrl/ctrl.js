/**
 * @file
 * Handles communication with the application and provides config.
 */

var allowed = ['127.0.0.1'];

var CTRL = function CTRL(app, bus, allowed) {
  "use strict";

  var self = this;

  self.bus = bus;
  self.allowed = allowed;

  /**
   * Default get request.
   */
  app.get('/ctrl', function (req, res) {
    if (self.checkAccess(req)) {
      res.status(501).send('Please see documentation about using the controller interface.');
    }
    else {
      res.status(401).end();
    }
  });

  /**
   * Reload front end.
   */
  app.get('/ctrl/reload', function (req, res) {
    if (self.checkAccess(req)) {
      bus.emit('frontend.reload');
      res.status(200).end();
    }
    else {
      res.status(401).end();
    }
  });

  /**
   * Handle SIP2 configuration request.
   *
   * @TODO: Load from backend web-service dims.
   */
  bus.on('config.fbs', function sip2config(data) {
    bus.emit(data.busEvent, {
      'username': 'sip2',
      'password': 'password',
      'endpoint': 'https://ET.Cicero-fbs.com/rest/sip2/DK-761500',
      'agency': 'DK-761500',
      'location': 'hb'
    });
  });

  /**
   * Handle notification template configuration request.
   *
   * @TODO: Load from backend web-service dims.
   */
  bus.on('config.notification', function libraryConfig(data) {
    bus.emit(data.busEvent, {
      'library': {
        'title': 'Det besøgte bibliotek',
        'name': 'Test bibliotek',
        'address': 'Testvej 123',
        'zipcode': '8000',
        'city': 'Aarhus',
        'phone': '12344556'
      },
      'footer': {
        'html': 'Åbningstider: se <a href="https://www.aakb.dk" target="_blank">www.aakb.dk</a>',
        'text': 'Åbningstider: se www.aakb.dk'
      }
    });
  });

  /**
   * @TODO: Move to separate configurable file.
   */
  bus.on('config.features.request', function () {
    bus.emit('config.features', [
      {
        "text": "menu.borrow",
        "url": "/#/login/borrow",
        "icon": "glyphicon-tasks"
      },
      {
        "text": "menu.status",
        "url": "/#/login/status",
        "icon": "glyphicon-refresh"
      },
      {
        "text": "menu.reservations",
        "url": "/#/login/reservations",
        "icon": "glyphicon-list-alt"
      },
      {
        "text": "menu.return",
        "url": "/#/return",
        "icon": "glyphicon-time"
      }
    ]);
  });

  /**
   * @TODO: Move to separate configurable file.
   */
  bus.on('config.languages.request', function () {
    bus.emit('config.languages', [
      {
        "text": "language.da",
        "langKey": "da",
        "icon": "img/flags/DK.png"
      },
      {
        "text": "language.en",
        "langKey": "en",
        "icon": "img/flags/GB.png"
      }
    ]);
  });

  // @TODO: Temporary code.
  // @TODO: Remove all this translations code when it receives translations from administration.
  var trans = {
    "da": {
      "menu.borrow": "Lån",
      "menu.status": "Status / Forny",
      "menu.reservations": "Reservationer",
      "menu.return": "Aflevering",

      "common.back": "Tilbage",
      "common.loading": "Indlæser",
      "common.kr": "kr.",

      "index.heading": "Vælg ønsket funktion",

      "language.en": "Engelsk",
      "language.da": "Dansk",

      "login.heading": "Log ind",
      "login.scan": "Skan dit sygesikringskort eller lånerkort",
      "login.button.manual_login": "Indtast via tastatur - tryk her!",
      "login.username": "CPR-nummer",
      "login.username_short": "CPR",
      "login.username_help": "Indtast CPR-nummer og tryk Enter",
      "login.username_validation_error": "Ikke gyldigt cpr-nummer",
      "login.password": "Kodeord",
      "login.password_short": "Kode",
      "login.password_help": "Indtast kodeord og tryk Enter",
      "login.password_validation_error": "Ikke gyldigt kodeord",

      "reservations.heading": "Reservationer",
      "reservations.bibliographic_id": "Stregkode",
      "reservations.interest_date": "Interessedato",
      "reservations.title": "Titel",
      "reservations.ready": "Til rådighed",
      "reservations.reservation_number": "Kø-nummer",
      "reservations.pickup_location": "Afhentningssted",

      "status.heading": "Status / Forny",
      "status.title": "Titel",
      "status.return_date": "Afleveringsdato",
      "status.fine": "Gebyr",
      "status.new_date": "Ny dato",
      "status.information": "Information",
      "status.actions": "Handlinger",
      "status.button.renew": "Forny",
      "status.button.renew_all": "Forny alle",
      "status.button.fines": "Gebyr",
      "status.button.receipt": "Kvittering",
      "status.button.ok": "Ok",
      "status.button.close": "Luk",
      "status.button.receipt_mail": "Email",
      "status.button.receipt_printer": "Print",
      "status.renew.ok": "Materiale fornyet",
      "status.receipt.heading": "Kvittering",
      "status.fines.heading": "Gebyr",
      "status.fines.fine": "Gebyr",

      "borrow.heading": "Lån",
      "borrow.title": "Titel",
      "borrow.return_date": "Afleveringsdato",
      "borrow.status": "Status",
      "borrow.information": "Information",

      "return.heading": "Aflever",
      "return.title": "Titel",
      "return.status": "Status",
      "return.information": "Information",

      "numpad.back": "Slet",
      "numpad.enter": "Enter",
      "numpad.one": "1",
      "numpad.two": "2",
      "numpad.three": "3",
      "numpad.four": "4",
      "numpad.five": "5",
      "numpad.six": "6",
      "numpad.seven": "7",
      "numpad.eight": "8",
      "numpad.nine": "9",
      "numpad.zero": "0",

      "[BEFORE_RENEW_PERIOD]": "For tidligt fornyet",
      "UNSUCCESSFUL": "Lykkedes ikke",

      "DKK": "kr."
    },
    "en": {
      "menu.borrow": "Borrow",
      "menu.status": "Status / Renew",
      "menu.reservations": "Reservations",
      "menu.return": "Return",

      "common.back": "Back",
      "common.loading": "Loading",

      "index.heading": "Choose the desired function",

      "language.en": "English",
      "language.da": "Danish",

      "login.heading": "Login",
      "login.scan": "Scan your social security card or library card",
      "login.button.manual_login": "Enter with keyboard - press here!",
      "login.username": "CPR-number",
      "login.username_short": "CPR",
      "login.username_help": "Enter your CPR-number and press enter",
      "login.username_validation_error": "Not valid CPR-number",
      "login.password": "Password",
      "login.password_short": "Pass",
      "login.password_help": "Enter your password and press enter",
      "login.password_validation_error": "Not valid password",

      "reservations.heading": "Reservations",
      "reservations.bibliographic_id": "Barcode",
      "reservations.interest_date": "Interest date",
      "reservations.title": "Title",
      "reservations.ready": "Available",
      "reservations.reservation_number": "Number in Queue",
      "reservations.pickup_location": "Pickup Location",

      "status.heading": "Status / Renew",
      "status.title": "Title",
      "status.return_date": "Return date",
      "status.fine": "Fine",
      "status.new_date": "New date",
      "status.information": "Information",
      "status.actions": "Actions",
      "status.button.renew": "Renew",

      "borrow.heading": "Borrow",
      "borrow.title": "Title",
      "borrow.return_date": "Return date",
      "borrow.status": "Status",
      "borrow.information": "Information",

      "numpad.back": "Delete",
      "numpad.enter": "Enter",
      "numpad.one": "1",
      "numpad.two": "2",
      "numpad.three": "3",
      "numpad.four": "4",
      "numpad.five": "5",
      "numpad.six": "6",
      "numpad.seven": "7",
      "numpad.eight": "8",
      "numpad.nine": "9",
      "numpad.zero": "0",

      "[BEFORE_RENEW_PERIOD]": "Before renew period"
    }
  };
  // @TODO: Temporary code.
  setTimeout(function () {
    bus.emit('config.translations.update', {
      "translations": trans,
      "busEvent": "config.translations"
    });
  }, 1000);
};

/**
 * Access check based on IP.
 *
 * @param req
 *   The express request.

 * @returns {boolean}
 *   If allowed TRUE else FALSE.
 */
CTRL.prototype.checkAccess = function checkAccess(req) {
  var ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
  var ret = this.allowed.indexOf(ip) > -1;

  this.bus.emit('logger.info', 'CTRL: ' + ip + ' requested have accessed to ' + req.url + (ret ? ' (allowed)' : ' (denied)'));

  return ret;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {

  var ctrl = new CTRL(imports.app, imports.bus, options.allowed);

  register(null, { "ctrl": ctrl });
};