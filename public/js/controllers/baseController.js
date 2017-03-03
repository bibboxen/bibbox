/**
 * @file
 * Borrow page controller.
 */

angular.module('BibBox').controller('BaseController', ['$scope', '$location', '$q', 'userService', 'Idle', 'config',
  function ($scope, $location, $q, userService, Idle, config) {
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
          // @TODO: Report error.
          console.error(err);
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
    $scope.baseResetIdleWatch = function baseResetIdleWatch(secondsAdded = 0) {
      Idle.setIdle(config.timeout.idleTimeout + secondsAdded);

      Idle.watch();
    };

    // Start the idle service.
    $scope.baseResetIdleWatch();

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {

    });
  }
]);
