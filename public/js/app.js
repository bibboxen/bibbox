/**
 * @file
 * Defines the Angular JS application for the administration frontend.
 */

// Define the angular application.
angular.module('BibBox', ['ngRoute', 'pascalprecht.translate', 'tmh.dynamicLocale', 'ngIdle']);

// Set path for dynamic locale loading.
angular.module('BibBox').config(['tmhDynamicLocaleProvider', 'IdleProvider', 'KeepaliveProvider',
    function (tmhDynamicLocaleProvider, IdleProvider, KeepaliveProvider) {
      tmhDynamicLocaleProvider.localeLocationPattern('/js/lib/locales/angular-locale_{{locale}}.js');
	  
	   // configure Idle settings
      IdleProvider.idle(10); // in seconds
      IdleProvider.timeout(5); // in seconds
    }
  ]
)
.run(function(Idle){
  // start watching when the app runs. also starts the Keepalive service by default.
  Idle.watch();
});