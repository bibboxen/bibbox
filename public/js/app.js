/**
 * @file
 * Defines the Angular JS application for the administration frontend.
 */

// Define the angular application.
angular.module('BibBox', ['ngRoute', 'pascalprecht.translate', 'tmh.dynamicLocale', 'ngIdle', 'mgcrea.ngStrap.modal', 'ngAnimate']);

// Set path for dynamic locale loading.
angular.module('BibBox').config(['tmhDynamicLocaleProvider', 'IdleProvider',
    function (tmhDynamicLocaleProvider, IdleProvider) {
      tmhDynamicLocaleProvider.localeLocationPattern('/js/lib/locales/angular-locale_{{locale}}.js');

      // configure Idle settings, defaults.
      IdleProvider.idle(10);   // in seconds
      IdleProvider.timeout(5); // in seconds
    }
  ]
)
.run(function (Idle) {
  // start watching when the app runs. also starts the Keepalive service by default.
  Idle.watch();
});