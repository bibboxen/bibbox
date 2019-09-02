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
  'ngAnimate',
  'ui.bootstrap',
  'angulartics',
  'angulartics.piwik'
]);

// Set path for dynamic translation loading and set default idle configuration.
angular.module('BibBox').config(['tmhDynamicLocaleProvider', 'IdleProvider', '$analyticsProvider', '$provide',
  function (tmhDynamicLocaleProvider, IdleProvider, $analyticsProvider, $provide) {
    'use strict';

    // There seam to be an error in newer version of chrome (30/08/19) that sometimes makes loading the index template
    // fail. It's always on the first load and if you reload the browser it all works again. So we detected it an
    // reloads the browser.
    $provide.decorator('$exceptionHandler', function ($delegate) {
      return function (exception, cause) {
        $delegate(exception, cause);
        if (exception.message.startsWith('[$compile:tpload]')) {
          setTimeout(function() {
            window.location.reload();
          }, 1000);
        }
      };
    });

    tmhDynamicLocaleProvider.localeLocationPattern('/js/lib/locales/angular-locale_{{locale}}.js');

    // Configure Idle settings, defaults.
    IdleProvider.idle(10);
    IdleProvider.timeout(5);
  }
]).run(function (Idle) {
  'use strict';

  // Start watching when the app runs. also starts the keep-alive service
  // by default.
  Idle.watch();
});
