/**
 * @file
 * Index page controller.
 */

/**
 * The Index controller.
 *
 * Note: The configService has to be a dependency to load the configuration.
 */
angular.module('BibBox').controller('IndexController', ['$rootScope', '$scope', '$controller', '$translate', 'configService', 'userService', 'config', 'tmhDynamicLocale', '$interval',
  function ($rootScope, $scope, $controller, $translate, configService, userService, config, tmhDynamicLocale, $interval) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

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

      // Handel error in loading config (out-of-order).
      $rootScope.$on('config.error', function () {
        $scope.error = true;
        $scope.loading = false;
      });

      // Handle connection errors (out-of-order).
      $rootScope.$on('connection.error', function () {
        $scope.error = true;
        $scope.loading = false;
      })

      // Handle re-connection.
      $rootScope.$on('connection.connected', function () {
        if ($scope.error === true) {
          $scope.error = false;
        }
      })
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
      userService.isOnline().then(function (status) {
        $scope.online = status;
      },
      function (err) {
        $scope.online = false;
      });
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
