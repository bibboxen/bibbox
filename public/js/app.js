/**
 * @file
 * Defines the Angular JS application for the administration frontend.
 */

// Define the angular application.
angular.module('BibBox', ['ngRoute', 'pascalprecht.translate', 'tmh.dynamicLocale']);

// Set path for dynamic locale loading.
angular.module('BibBox').config(['tmhDynamicLocaleProvider',
    function (tmhDynamicLocaleProvider) {
      tmhDynamicLocaleProvider.localeLocationPattern('/js/lib/locales/angular-locale_{{locale}}.js');
    }
  ]
);
