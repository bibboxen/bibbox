/**
* @file
* Defines the Angular JS application the run the administration frontend.
*/

// Define the angular application.
angular.module('BibBox', [ 'ngRoute', 'pascalprecht.translate' ]);

// Setup translations.
angular.module('BibBox').config(['$translateProvider', function ($translateProvider) {
  $translateProvider
    .useSanitizeValueStrategy('escape')
    .preferredLanguage('da')
    .fallbackLanguage('en');
}]);