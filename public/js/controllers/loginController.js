/**
 * Status page controller.
 */
angular.module('BibBox').controller('LoginController', ['$scope', '$http', '$window', '$location', '$routeParams', 'proxyService',
  function($scope, $http, $window, $location, $routeParams, proxyService) {
    "use strict";

    proxyService.emitEvent('barcode.start', 'barcode.data', 'barcode.err').then(
      function success(data) {
        console.log(data);
      },
      function error(err) {
        console.log(err);
      }
    );

    proxyService.emitEvent('barcode.list', 'barcode.list.res', 'barcode.err', 'barcode.list.res').then(
      function success(data) {
        console.log(data);
      },
      function error(err) {
        console.log(err);
      }
    );

    var usernameRegExp = /[0-3][0-9][0-1][1-9]\d{6}/;
    var passwordRegExp = /\d+/;
    $scope.loggedIn = false;
    $scope.display = 'default';
    $scope.user = {
      username : '',
      password: ''
    };

    $scope.useManualLogin = function useManualLogin() {
      $scope.display = 'username';
    };

    $scope.usernameEntered = function usernameEntered() {
      if (!usernameRegExp.test($scope.user.username)) {
        $scope.usernameValidationError = true;
      }
      else {
        $scope.usernameValidationError = false;
        $scope.display = 'password';
      }
    };

    $scope.passwordEntered = function passwordEntered() {
      if (!passwordRegExp.test($scope.user.password)) {
        $scope.passwordValidationError = true;
      }
      else {
        $scope.passwordValidationError = false;
        login();
      }
    };

    var login = function login() {
      $scope.loggedIn = true;

      // @TODO: send login to service

      $location.path("/" + $routeParams.redirectUrl);
    };


  }
]);
