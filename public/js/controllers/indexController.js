/**
 * Index page controller.
 */
angular.module('BibBox').controller('IndexController', ['$scope', '$http', '$window', '$location', '$translate', 'proxyService', 'config', 'tmhDynamicLocale',
  function ($scope, $http, $window, $location, $translate, proxyService, config, tmhDynamicLocale) {
    "use strict";

    $scope.running = false;

    /**
     * Request config.
     */
    proxyService.emitEvent('config.translations.request', 'config.translations', 'config.translations.error', {"busEvent": "config.translations"}).then(
      function success() {
        proxyService.emitEvent('config.languages.request', 'config.languages', 'config.languages.error', {"busEvent": "config.languages"}).then(
          function success() {
            proxyService.emitEvent('config.features.request', 'config.features', 'config.features.error', {"busEvent": "config.features"}).then(
              function success() {
                $scope.features = config.features;
                $scope.languages = config.languages;

                $scope.running = true;
              });
          });
      },
      function error(err) {
        // @TODO: Handle error.
      }
    );

    /**
     * Change the language.
     *
     * @param langKey
     */
    $scope.changeLanguage = function changeLanguage(langKey) {
      $translate.use(langKey);
      tmhDynamicLocale.set(langKey);
    }
  }
]);
