angular.module('BibBox').config(['$translateProvider', function ($translateProvider) {
  var daTranslations = {
    "menu.borrow": "Lån",
    "menu.status": "Status / Forny",
    "menu.reservations": "Reservationer",
    "menu.return": "Aflevering",

    "common.back": "Tilbage",

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
    "reservations.barcode": "Stregkode",
    "reservations.title": "Titel",
    "reservations.ready": "Til rådighed",
    "reservations.reservation_number": "Kø-nummer",
    "reservations.information": "Information",

    "status.title": "Titel",
    "status.return_date": "Afleveringsdato",
    "status.bill": "Gebyr",
    "status.new_date": "Ny dato",
    "status.information": "Information",
    "status.actions": "Handlinger",
    "status.button.renew": "Forny",

    "numpad.back": 'Slet',
    "numpad.enter": 'Enter',
    "numpad.one": '1',
    "numpad.two": '2',
    "numpad.three": '3',
    "numpad.four": '4',
    "numpad.five": '5',
    "numpad.six": '6',
    "numpad.seven": '7',
    "numpad.eight": '8',
    "numpad.nine": '9',
    "numpad.zero": '0'
  };

  $translateProvider
    .translations('da', daTranslations);
}]);