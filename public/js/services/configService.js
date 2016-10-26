/**
 * @file
 * config holds the configuration for the app and accepts config updates.
 */

angular.module('BibBox').service('configService', ['$rootScope', '$translate', 'tmhDynamicLocale', 'proxyService', 'config',
  function ($rootScope, $translate, tmhDynamicLocale, proxyService, config) {
    'use strict';

    // Set default language from config. It's need when requesting receipts.
    tmhDynamicLocale.set(config.default_lang);

    /**
     * Listen for UI configuration changes.
     *
     * Emits 'config.updated' into the $rootScope when updated.
     */
    proxyService.onEvent('config.ui.update', function (data) {
      if (data === false) {
        $rootScope.$emit('config.error');
      }
      else {
        // Mark config as initialized, so the application can present the UI.
        config.initialized = true;

        angular.merge(config, data);
        $rootScope.$emit('config.updated');
      }
    });

    /**
     * Listen to translations update.
     *
     * A $rootScope event (config.translations.updated) is emitted and the
     * translations are refreshed.
     */
    proxyService.onEvent('config.ui.translations.update', function (data) {
      if (data === false) {
        $rootScope.$emit('config.error');
      }
      else {
        // Mark config as initialized, so the application can present the UI.
        config.initialized = true;

        angular.merge(config, data);
        $rootScope.$emit('config.translations.updated');
        $translate.refresh();
      }
    });
  }
]);

/**
 * Configuration object.
 *
 * Used to store configuration when pushed from the backend. It also contains
 * default value before configuration is loaded.
 */
angular.module('BibBox').value('config', {
  default_lang: 'da',
  initialized: false,
  translations: {},
  languages: [],
  features: [],
  timeout: {
    idleTimeout: 15,
    IdleWarn: 5
  },
  testFbsConnectionInterval: 5000
});
