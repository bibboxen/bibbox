/**
 * Status page controller.
 */
angular.module('BibBox').controller('LoginController', ['$scope', '$http', '$window', '$location', '$routeParams', 'proxyService', 'userService',
  function($scope, $http, $window, $location, $routeParams, proxyService, userService) {
    "use strict";

    var usernameRegExp = /[0-3][0-9][0-1][1-9]\d{6}/;
    var passwordRegExp = /\d+/;
    $scope.loggedIn = false;
    $scope.display = 'default';
    $scope.user = {
      username : '',
      password: ''
    };

    var barcodeResult = function barcodeResult(data) {
      $scope.user.username = data;
      $scope.usernameEntered();
    };

    var barcodeError = function barcodeError(err) {
      // @TODO: Handle error.
      console.log(err);
    };

    /**
     * Start scanning for a barcode.
     * Stops after one "barcode.data" has been returned.
     */
    var startBarcode = function scanBarcode() {
      proxyService.emitEvent('barcode.start', 'barcode.data', 'barcode.err', {}).then(
        function success(data) {
          barcodeResult(data);
          stopBarcode();
        },
        function error(err) {
          barcodeError(err);
        }
      );
    };

    /**
     * Stop scanning for a barcode.
     */
    var stopBarcode = function stopBarcode() {
      proxyService.emitEvent('barcode.stop', null, null, {}).then();
    };


    /**
     * Use manual login.
     *
     * @param useManualLogin
     */
    $scope.useManualLogin = function useManualLogin(useManualLogin) {
      if (useManualLogin) {
        $scope.display = 'username';
        stopBarcode();
      }
      else {
        $scope.display = 'default';
        startBarcode();
      }
    };

    /**
     *
     */
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
      console.log($scope.user.username + " - " + $scope.user.password + " is logging in.");

      userService.login($scope.user.username, $scope.user.password).then(
        function success() {
          $scope.loggedIn = userService.loggedIn;
          $location.path("/" + $routeParams.redirectUrl);
        },
        function error() {
          // @TODO: Handle error.
        }
      );
    };

    startBarcode();
  }
]);
