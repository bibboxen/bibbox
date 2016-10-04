/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', ['$scope', '$location',
  function($scope, $location) {
    'use strict';

    $scope.materials = [];

    /**
     * Goto to front page.
     */
    $scope.gotoFront = function gotoFront() {
      $location.path('/');
    };

    /**
     * On destroy.
     */
    $scope.$on("$destroy", function() {

    });
  }
]);
