angular.module('BibBox').config(['$translateProvider', function ($translateProvider) {
  var enTranslations = {
    "menu.borrow": "Borrow",
    "menu.status": "Status / Renew",
    "menu.reservations": "Reservations",
    "menu.return": "Return",

    "common.back": "Back",

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
    "reservations.barcode": "Barcode",
    "reservations.title": "Title",
    "reservations.ready": "Available",
    "reservations.reservation_number": "Number in Queue",
    "reservations.information": "Information",

    "status.heading": "Status / Renew",
    "status.title": "Title",
    "status.return_date": "Return date",
    "status.bill": "Bill",
    "status.new_date": "New date",
    "status.information": "Information",
    "status.actions": "Actions",
    "status.button.renew": "Renew",

    "numpad.back": 'Delete',
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
    .translations('en', enTranslations);
}]);