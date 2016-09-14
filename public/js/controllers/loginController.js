/**
 * Status page controller.
 */
angular.module('BibBox').controller('LoginController', ['$scope', '$http', '$window', '$location', '$routeParams',
  function($scope, $http, $window, $location, $routeParams) {
    "use strict";

    $scope.loggedIn = false;

    $scope.login = function login() {
      $scope.loggedIn = true;
      $location.path("/" + $routeParams.redirectUrl);
    }
  }
]);
