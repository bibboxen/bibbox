/**
 * Index page controller.
 */
angular.module('BibBox').controller('IndexController', [
  '$scope', '$http', '$window', '$location', '$translate', 'proxyService', 'config', 'tmhDynamicLocale', '$interval',
  function ($scope, $http, $window, $location, $translate, proxyService, config, tmhDynamicLocale, $interval) {
    "use strict";

    var onlineInterval = null;

    $scope.loading = true;

    /**
     * Request config.
     *
     * @TODO: Gather in single config.request event.
     */
    proxyService.emitEvent('config.translations.request', 'config.translations', 'config.translations.error', {"busEvent": "config.translations"})
    .then(
      function success() {
        proxyService.emitEvent('config.languages.request', 'config.languages', 'config.languages.error', {"busEvent": "config.languages"})
        .then(
          function success() {
            proxyService.emitEvent('config.features.request', 'config.features', 'config.features.error', {"busEvent": "config.features"})
            .then(
              function success() {
                // Expose features and languages to scope.
                $scope.features = config.features;
                $scope.languages = config.languages;

                $scope.loading = false;
              },
              function error(err) {
                // @TODO: Handle error.
                console.log("config.features.request", err);
              });
          },
          function error(err) {
            // @TODO: Handle error.
            console.log("config.languages.request", err);
          });
      },
      function error(err) {
        // @TODO: Handle error.
        console.log("config.translations.request", err);
      }
    );

    var fbsOnline = function () {
      var uniqueId = CryptoJS.MD5("indexController" + Date.now());

      proxyService.emitEvent('fbs.online', 'fbs.online.response' + uniqueId, 'fbs.err', {'busEvent': 'fbs.online.response' + uniqueId})
      .then(
        function success(online) {
          $scope.online = online;
        },
        function error(err) {
          // @TODO: Handle error?
          console.log("fbs.online", err);
        }
      );
    };
    fbsOnline();

    onlineInterval = $interval(
      fbsOnline,
      config.testFbsConnectionInterval
    );

    /**
     * Change the language.
     *
     * @param langKey
     */
    $scope.changeLanguage = function changeLanguage(langKey) {
      $translate.use(langKey);
      tmhDynamicLocale.set(langKey);
    };

    $scope.$on('destroy', function () {
      // Remove online interval.
      if (angular.isDefined(onlineInterval)) {
        $interval.cancel(onlineInterval);
        onlineInterval = undefined;
      }
    });
  }
]);
