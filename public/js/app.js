/**
 * @file
 * Defines the Angular JS application for the administration frontend.
 */

// Define the angular application and its dependencies.
angular.module('BibBox', [
  'ngRoute',
  'pascalprecht.translate',
  'tmh.dynamicLocale',
  'ngIdle',
  'mgcrea.ngStrap.modal',
  'ngAnimate'
]);

// Set path for dynamic translation loading and set default idle configuration.
angular.module('BibBox').config(['tmhDynamicLocaleProvider', 'IdleProvider',
    function (tmhDynamicLocaleProvider, IdleProvider) {
      tmhDynamicLocaleProvider.localeLocationPattern('/js/lib/locales/angular-locale_{{locale}}.js');

      // Configure Idle settings, defaults.
      IdleProvider.idle(10);
      IdleProvider.timeout(5);
    }
  ]
)
.run(function (Idle) {
  // Start watching when the app runs. also starts the keep-alive service
  // by default.
  Idle.watch();
});