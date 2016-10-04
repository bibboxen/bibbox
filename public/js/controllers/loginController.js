/**
 * Status page controller.
 */
angular.module('BibBox').controller('LoginController', ['$scope', '$http', '$window', '$location', '$routeParams', 'proxyService', 'userService',
  function ($scope, $http, $window, $location, $routeParams, proxyService, userService) {
    'use strict';

    // @TODO: Update validation functions.
    var usernameRegExp = /\d{10}/;
    var passwordRegExp = /\d+/;

    // Log out of user service.
    userService.logout();

    // Clean local user.
    var resetUser = function resetUser() {
      $scope.user = {
        username: '',
        password: ''
      };
    };
    resetUser();

    /**
     * Sets the $scope.display variable.
     *
     * @param step
     */
    var gotoStep = function (step) {
      $scope.display = step;
    };
    gotoStep('default');

    /**
     * Barcode result handler.
     *
     * @param data
     */
    var barcodeResult = function barcodeResult(data) {
      $scope.user.username = data;
      $scope.usernameEntered();
    };

    /**
     * Barcode error handler.
     *
     * @param err
     */
    var barcodeError = function barcodeError(err) {
      // Ignore error. Restart barcode scanner.
      // @TODO: Should this be handled differently?
      startBarcode();
    };

    /**
     * Start scanning for a barcode.
     * Stops after one "barcode.data" has been returned.
     */
    var startBarcode = function scanBarcode() {
      proxyService.emitEvent('barcode.start', 'barcode.data', 'barcode.err', {})
        .then(
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
     * @param use
     */
    $scope.useManualLogin = function useManualLogin(use) {
      resetUser();

      if (use) {
        gotoStep('username');
        stopBarcode();
      }
      else {
        gotoStep('default');
        startBarcode();
      }
    };

    /**
     * Username entered.
     *
     * Enter button handler for username screen.
     */
    $scope.usernameEntered = function usernameEntered() {
      if ($scope.user.username === '' || !usernameRegExp.test($scope.user.username)) {
        $scope.usernameValidationError = true;
      }
      else {
        $scope.usernameValidationError = false;
        $scope.display = 'password';
      }
    };

    /**
     * Password entered.
     *
     * Enter button handler for password screen.
     */
    $scope.passwordEntered = function passwordEntered() {
      if ($scope.user.password === '' || !passwordRegExp.test($scope.user.password)) {
        $scope.passwordValidationError = true;
      }
      else {
        $scope.passwordValidationError = false;
        login();
      }
    };

    /**
     * Login.
     *
     * Calls FBS to verify credentials.
     */
    var login = function login() {
      stopBarcode();

      userService.login($scope.user.username, $scope.user.password).then(
        function success(loggedIn) {
          if (loggedIn) {
            $location.path("/" + $routeParams.redirectUrl);
          }
          else {
            $scope.passwordValidationError = true;
          }
        },
        function error() {
          $scope.invalidLoginError = true;
          resetUser();
          gotoStep('default');
        }
      );
    };

    startBarcode();
  }
]);
