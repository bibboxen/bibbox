/**
 * @file
 * Sets up translations for the app.
 *
 * @TODO: This file need som more documentation.
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

angular.module('BibBox').config(['$translateProvider', function ($translateProvider) {
  // Set up translations.
  // Loads from json files, preferred language da, fallback en.
  // @TODO: Which fallback file?
  $translateProvider
    .useSanitizeValueStrategy('escape')
    .useLoader('bibboxTranslationLoader')
    .preferredLanguage('da')
    .fallbackLanguage('en')
    .forceAsyncReload(true);
}]);
