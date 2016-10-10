/**
 * Status page controller.
 */
angular.module('BibBox').controller('LoginController', ['$scope', '$http', '$window', '$location', '$routeParams', 'proxyService', 'userService',
  function ($scope, $http, $window, $location, $routeParams, proxyService, userService) {
    'use strict';

    // @TODO: Block user on X number of failed login attempts.

    // @TODO: Update validation functions.
    var usernameRegExp = /^\d{10}$/;
    var passwordRegExp = /\d+/;

    var barcodeRunning = false;

    // Log out of user service.
    userService.logout();

    $scope.display = 'default';
    $scope.loading = false;

    // Clean local user.
    var resetScope = function resetScope() {
      $scope.user = {
        username: '',
        password: ''
      };

      $scope.passwordValidationError = false;
      $scope.usernameValidationError = false;
    };
    resetScope();

    $scope.$on('IdleWarn', function (e, countdown) {
      $scope.$apply(function () {
        $scope.countdown = countdown;
      });
    });

    $scope.$on('IdleTimeout', function () {
      $scope.$apply(function () {
        $location.path('/');
      });
    });

    $scope.$on('IdleEnd', function () {
      $scope.$apply(function () {
        $scope.countdown = null;
      });
    });

    /**
     * Sets the $scope.display variable.
     *
     * @param step
     */
    var gotoStep = function (step) {
      $scope.display = step;

      if (step === 'default') {
        startBarcode();
      }
    };

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
      console.log(err);
      // Ignore error. Restart barcode scanner.
      // @TODO: Should this be handled differently?
      startBarcode();
    };

    /**
     * Start scanning for a barcode.
     * Stops after one "barcode.data" has been returned.
     */
    var startBarcode = function startBarcode() {
      barcodeRunning = true;

      proxyService.emitEvent('barcode.start', 'barcode.data', 'barcode.err', {})
        .then(
          function success(data) {
            // Ignore result if the barcode should not be running.
            if (barcodeRunning) {
              barcodeResult(data);
              stopBarcode();
            }
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
      if (barcodeRunning) {
        proxyService.emitEvent('barcode.stop', null, null, {}).then(
          function () {
            barcodeRunning = false;
          }
        );
      }
    };

    /**
     * Use manual login.
     *
     * @param use
     */
    $scope.useManualLogin = function useManualLogin(use) {
      resetScope();

      if (use) {
        stopBarcode();
        gotoStep('username');
      }
      else {
        gotoStep('default');
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
        stopBarcode();

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
      $scope.loading = true;

      userService.login($scope.user.username, $scope.user.password).then(
        function success(loggedIn) {
          $scope.loading = false;

          if (loggedIn) {
            $location.path("/" + $routeParams.redirectUrl);
          }
          else {
            $scope.passwordValidationError = true;
          }
        },
        function error() {
          // @TODO: Show error.
          resetScope();
          gotoStep('default');

          $scope.loading = false;
        }
      );
    };

    // Go to start page.
    gotoStep('default');

    /**
     * On destroy.
     */
    $scope.$on("$destroy", function() {
      stopBarcode();
    });
  }
]);
