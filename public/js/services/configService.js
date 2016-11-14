/**
 * @file
 * config holds the configuration for the app and accepts config updates.
 */

angular.module('BibBox').service('configService', ['$rootScope', '$translate', 'tmhDynamicLocale', 'proxyService', 'config', 'Idle',
  function ($rootScope, $translate, tmhDynamicLocale, proxyService, config, Idle) {
    'use strict';

    // Set default language from config. It's need when requesting receipts.
    tmhDynamicLocale.set(config.default_lang);

    /**
     * Listen for UI configuration changes.
     *
     * Emits 'config.updated' into the $rootScope when updated.
     */
    proxyService.on('config.ui.update', function (data) {
      // Mark config as initialized, so the application can present the UI.
      config.initialized = true;

      angular.merge(config, data);

      // Update idle timeouts
      Idle.setIdle(config.timeout.idleTimeout);
      Idle.setTimeout(config.timeout.idleWarn);

      $rootScope.$emit('config.updated');
    });

    /**
     * Listen for UI configuration changes errors.
     */
    proxyService.on('config.ui.update.error', function (err) {
      $rootScope.$emit('config.error', err);
    });

    /**
     * Listen to translations update.
     *
     * A $rootScope event (config.translations.updated) is emitted and the
     * translations are refreshed.
     */
    proxyService.on('config.ui.translations.update', function (data) {
      // Mark config as initialized, so the application can present the UI.
      config.initialized = true;

      angular.merge(config, data);
      $rootScope.$emit('config.translations.updated');
      $translate.refresh();
    });

    /**
     * Listen to translations update errors.
     */
    proxyService.on('config.ui.translations.update.error', function (err) {
      $rootScope.$emit('config.error', err);
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
  loginAttempts: {
    max: 5,
    timeLimit: 15 * 60 * 1000
  },
  testFbsConnectionInterval: 5000
});
