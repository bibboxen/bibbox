/**
 * @file
 * config holds the configuration for the app and accepts config updates.
 */

angular.module('BibBox').service('configService', ['$rootScope', '$translate', 'tmhDynamicLocale', 'proxyService', 'config',
  function ($rootScope, $translate, tmhDynamicLocale, proxyService, config) {
    'use strict';

    // @TODO: default language from config.
    tmhDynamicLocale.set('da');

    proxyService.onEvent('config.ui.update', function (data) {
      config.initialized = true;

      angular.merge(config, data);
      $rootScope.$emit('config.updated');
    });

    proxyService.onEvent('config.ui.translations.update', function (data) {
      config.initialized = true;

      angular.merge(config, data);
      $rootScope.$emit('config.translations.updated');
      $translate.refresh();
    });
  }
]);

angular.module('BibBox').value('config', {
  "initialized": false,
  "translations": {},
  "languages": [],
  "features": [],
  "timeout": {
    "idleTimeout": 15,
    "IdleWarn": 5
  },
  "testFbsConnectionInterval": 5000
});