/**
* @file
* Defines the Angular JS application the run the administration frontend.
*/

// Define the angular application.
angular.module('BibBox', [ 'ngRoute', 'pascalprecht.translate' ]);

var enTranslations = {
  "menu.borrow": "Borrow",
  "menu.status": "Status / Renew",
  "menu.reservations": "Reservations",
  "menu.return": "Return",

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

var daTranslations = {
  "menu.borrow": "Udlån",
  "menu.status": "Status / Forny",
  "menu.reservations": "Reservationer",
  "menu.return": "Aflevering",

  "index.heading": "Vælg ønsket funktion",

  "language.en": "Engelsk",
  "language.da": "Dansk",

  "login.heading": "Log ind",
  "login.scan": "Skan dit sygesikringskort eller lånerkort",
  "login.button.manual_login": "Indtast via tastatur - tryk her!",
  "login.username": "CPR nummer",
  "login.username_short": "CPR",
  "login.username_help": "Indtast cpr-nummer og tryk Enter",
  "login.username_validation_error": "Ikke gyldigt cpr-nummer",
  "login.password": "Kodeord",
  "login.password_short": "Kode",
  "login.password_help": "Indtast kodeord og tryk Enter",
  "login.password_validation_error": "Ikke gyldigt kodeord",

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


angular.module('BibBox').config(['$translateProvider', function ($translateProvider) {
  $translateProvider
    .useSanitizeValueStrategy('escape')
    .translations('en', enTranslations)
    .translations('da', daTranslations)
    .preferredLanguage('da');
}]);