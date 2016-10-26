/**
 * @file
 * Borrow page controller.
 */

angular.module('BibBox').controller('BaseController', ['$scope', '$location', '$q', 'userService', 'Idle',
  function ($scope, $location, $q, userService, Idle) {
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
          $scope.loading = false;

          // If patron exists, get reservations.
          if (patron) {
            $scope.currentPatron = patron;
            deferred.resolve();
          }
          else {
            $scope.loading = false;
            // @TODO: Report error.
            console.error('Patron not defined.');
          }
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
     * @TODO: Missing documentation.
     */
    $scope.$on('IdleWarn', function (e, countdown) {
      $scope.$apply(function () {
        $scope.countdown = countdown;
      });
    });

    /**
     * @TODO: Missing documentation.
     */
    $scope.$on('IdleTimeout', function () {
      $scope.$evalAsync(function () {
        $scope.baseLogoutRedirect('/');
      });
    });

    /**
     * @TODO: Missing documentation.
     */
    $scope.$on('IdleEnd', function () {
      $scope.$apply(function () {
        $scope.countdown = null;
      });
    });

    /**
     * Restart the idle service or start it if it's not running.
     */
    $scope.baseResetIdleWatch = function baseResetIdleWatch() {
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