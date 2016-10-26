/**
 * @file
 * Borrow page controller.
 */

angular.module('BibBox').controller('BaseController', ['$scope', '$location', 'userService', 'Idle',
  function ($scope, $location, userService, Idle) {
    'use strict';

    /**
     * Logout current user and redirect.
     *
     * @param path
     *   The path to redirect to.
     */
    $scope.baseLogoutRedirect = function logoutRedirect(path) {
      userService.logout();
      $location.path(path);
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