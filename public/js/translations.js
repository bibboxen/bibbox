/**
 * @file
 * Sets up translations for the app.
 */

/**
 * Translation loader.
 *
 * Loads translations from config file, if present.
 */
angular.module('BibBox').factory('bibboxTranslationLoader', ['$http', '$q', 'config',
  function ($http, $q, config) {
    'use strict';

    return function (options) {
      var deferred = $q.defer();

      // If translations exists in the config object, serve them, else reject.
      if (!config.hasOwnProperty('translations')) {
        deferred.reject(options.key);
      }
      else {
        deferred.resolve(config.translations[options.key]);
      }

      return deferred.promise;
    };
  }
]);

/**
 * Configure translation.
 */
angular.module('BibBox').config(['$translateProvider', function ($translateProvider) {
  'use strict';

  // Set up translations.
  // Sets up:
  // - translation loader
  // - preferred language danish
  // - fallback language english
  $translateProvider
    .useSanitizeValueStrategy('escape')
    .useLoader('bibboxTranslationLoader')
    .preferredLanguage('da')
    .fallbackLanguage('en')
    .forceAsyncReload(true);
}]);
