/**
 * @file
 * Borrow page controller.
 */

angular.module('BibBox').controller('BaseController', ['$scope', '$location', '$q', '$window', 'userService', 'Idle', 'config', 'loggerService', '$analytics',
  function ($scope, $location, $q, $window, userService, Idle, config, loggerService, $analytics) {
    'use strict';

    /**
     * Logout current user and redirect.
     *
     * @param path
     *   The path to redirect to. Defaults to front page ('/').
     */
    $scope.baseLogoutRedirect = function logoutRedirect(path) {
      path = path || '/';
      userService.logout();
      $location.path(path);
    };

    $scope.baseGetPatron = function baseGetPatron() {
      var deferred = $q.defer();

      userService.patron().then(
        function (patron) {
          $scope.currentPatron = patron;
          $scope.loading = false;
          deferred.resolve();
        },
        function (err) {
          $scope.loading = false;
          loggerService.error(err);
        }
      );

      return deferred.promise;
    };

    /**
     * Handle Idle timeout warnings.
     *
     * Update the idle counter warning in the UI.
     */
    $scope.$on('IdleWarn', function (e, countdown) {
      $scope.$apply(function () {
        $scope.countdown = countdown;
      });
    });

    /**
     * Handle idle timeouts.
     *
     * Redirect the user to the front-page.
     */
    $scope.$on('IdleTimeout', function () {
      $scope.$evalAsync(function () {
        $analytics.eventTrack('IdleTimeout', {  category: 'Timeout', label: $location.path() });
        $scope.baseLogoutRedirect('/');
      });
    });

    /**
     * Handle idle end events.
     *
     * Reset the UI count down.
     */
    $scope.$on('IdleEnd', function () {
      $scope.$evalAsync(function () {
        $scope.countdown = null;
      });
    });

    /**
     * Restart the idle service or start it if it's not running.
     */
    $scope.baseResetIdleWatch = function baseResetIdleWatch(secondsAdded) {
      $scope.countdown = null;

      secondsAdded = secondsAdded || 0;

      Idle.setIdle(config.timeout.idleTimeout + secondsAdded);

      Idle.watch();
    };

    // Start the idle service.
    $scope.baseResetIdleWatch();

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      // Remove all modal windows and it's backdrop.
      angular.element(document.querySelectorAll('.modal')).remove();
      angular.element(document.querySelectorAll('.modal-backdrop')).remove();

      // Remove body classes used by modal windows.
      var bodyElement = angular.element($window.document.body);
      bodyElement.removeClass('modal-open');
      bodyElement.removeClass('modal-with-am-fade');
    });
  }
]);
