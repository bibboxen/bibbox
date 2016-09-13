/**
* @file
* Defines the Angular JS application the run the administration frontend.
*/

// Define the angular application.
angular.module('BibBox', [ 'ngRoute', 'pascalprecht.translate' ]);

var enTranslations = {
  "menu.borrow": "Borrow",
  "menu.status": "Status/Renew",
  "menu.reservations": "Reservations",
  "menu.return": "Return",

  "index.heading": "Choose desired function",

  "language.en": "English",
  "language.da": "Danish"
};

var daTranslations = {
  "menu.borrow": "Udlån",
  "menu.status": "Status/Forny",
  "menu.reservations": "Reservationer",
  "menu.return": "Aflevering",

  "index.heading": "Vælg ønsket funktion",

  "language.en": "Engelsk",
  "language.da": "Dansk"
};


angular.module('BibBox').config(['$translateProvider', function ($translateProvider) {
  $translateProvider
    .translations('en', enTranslations)
    .translations('da', daTranslations)
    .preferredLanguage('en');
}]);