/**
 * @file
 * Index page controller.
 */

/**
 * The Index controller.
 *
 * Note: The configService has to be a dependency to load the configuration.
 */
angular.module('BibBox').controller('IndexController', ['$rootScope', '$scope', '$translate', 'configService', 'proxyService', 'config', 'tmhDynamicLocale', '$interval',
  function ($rootScope, $scope, $translate, configService, proxyService, config, tmhDynamicLocale, $interval) {
    'use strict';

    var onlineInterval = null;
    $scope.loading = true;

    /**
     * Get the configuration loaded correctly from the config object.
     */
    var init = function init() {
      $rootScope.$on('config.updated', function () {
        $scope.features = config.features;
        $scope.loading = false;
        $scope.error = false;
      });

      $rootScope.$on('config.translations.updated', function () {
        $scope.languages = config.languages;
      });

      if (config.initialized) {
        $scope.features = config.features;
        $scope.languages = config.languages;
        $scope.loading = false;
        $scope.error = false;
      }

      // Handel error in loading config.
      $rootScope.$on('config.error', function () {
        $scope.error = true;
        $scope.loading = false;
      });
    };
    init();

    /**
     * Check if fbs is online.
     *
     * @TODO: Should this be turned around, so the server push event if its
     *        off-line? Maybe into the config object, so all parts of the
     *        front-end has the information and can react on it if need be!
     */
    var fbsOnline = function () {
      var uniqueId = CryptoJS.MD5('indexController' + Date.now());

      proxyService.emitEvent('fbs.online', 'fbs.online.response' + uniqueId, 'fbs.err', {
        busEvent: 'fbs.online.response' + uniqueId
      })
      .then(
        function success(online) {
          $scope.online = online;
        },
        function error(err) {
          // @TODO: Handle error?
          console.error('fbs.online', err);
        }
      );
    };

    /**
     * Register interval checking of fbs connectivity.
     *
     * Also check now that it's online.
     */
    onlineInterval = $interval(fbsOnline, config.testFbsConnectionInterval);
    fbsOnline();

    /**
     * Change the language.
     *
     * @param langKey
     */
    $scope.changeLanguage = function changeLanguage(langKey) {
      $translate.use(langKey);
      tmhDynamicLocale.set(langKey);
    };

    /**
     * on Destroy.
     *
     * Cleanup
     */
    $scope.$on('$destroy', function () {
      // Remove online interval.
      if (angular.isDefined(onlineInterval)) {
        $interval.cancel(onlineInterval);
        onlineInterval = null;
      }
    });
  }
]);
