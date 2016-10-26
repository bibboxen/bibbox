/**
 * @file
 * Borrow page controller.
 */

angular.module('BibBox').controller('BaseController', ['$scope', '$location', 'Idle',
  function ($scope, $location, Idle) {
    'use strict';

    // Restart idle service if not running.
    Idle.watch();

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
        $location.path('/');
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
     * On destroy.
     */
    $scope.$on('$destroy', function () {

    });
  }
]);