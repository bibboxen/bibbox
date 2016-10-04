/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', ['$scope',
  function($scope) {
    'use strict';

    $scope.materials = [];

    /**
     * On destroy.
     */
    $scope.$on("$destroy", function() {

    });
  }
]);
