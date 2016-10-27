/**
 * Status page controller.
 */
angular.module('BibBox').controller('LoginController', ['$scope', '$controller', '$http', '$window', '$location', '$routeParams', 'userService', 'barcodeService',
  function ($scope, $controller, $http, $window, $location, $routeParams, userService, barcodeService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

    // @TODO: Block user on X number of failed login attempts.

    // @TODO: Update validation functions.
    var usernameRegExp = /^\d{10}$/;
    var passwordRegExp = /\d+/;

    $scope.display = 'default';
    $scope.loading = false;

    // Start listen to barcode events.
    barcodeService.start();

    /**
     * Reset user scope.
     *
     * Reset the user variables.
     */
    var resetScope = function resetScope() {
      $scope.user = {
        username: '',
        password: ''
      };

      $scope.invalidLoginError = false;
      $scope.passwordValidationError = false;
      $scope.usernameValidationError = false;
    };
    resetScope();

    /**
     * Sets the $scope.display variable.
     *
     * @param step
     *   @TODO: Missing documentation. (default, username, password)
     */
    var gotoStep = function (step) {
      $scope.display = step;
    };

    /**
     * Barcode result handler.
     *
     * @param data
     */
    $scope.$on('barcodeScanned', function (data) {
      switch ($scope.display) {
        case 'default':
          $scope.user.username = data;
          $scope.usernameEntered();
          break;
      }
    });

    /**
     * Barcode error handler.
     *
     * @param err
     */
    $scope.$on('barcodeError', function barcodeError(err) {
      // @TODO: inform user that barcode as faild and swith to manual.
      console.error(err);
    });

     /**
     * Use manual login.
     *
     * @param use
     *   @TODO: What is this?
     */
    $scope.useManualLogin = function useManualLogin(use) {
      resetScope();

      if (use) {
        gotoStep('username');
      }
      else {
        gotoStep('default');
      }
    };

    /**
     * Handle back button.
     */
    $scope.back = function back() {
      if ($scope.display === 'default') {
        barcodeService.stop();
        $scope.baseLogoutRedirect('/');
      }
      else {
        $scope.useManualLogin(false);
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
        $scope.invalidLoginError = false;
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
          $scope.baseResetIdleWatch();

          $scope.loading = false;
          if (loggedIn) {
            barcodeService.stop();
            $location.path('/' + $routeParams.redirectUrl);
          }
          else {
            resetScope();
            gotoStep('default');

            $scope.invalidLoginError = true;
            $scope.loading = false;
          }
        },
        function error(err) {
          $scope.baseResetIdleWatch();

          // @TODO: Show error.
          console.error('login error: ', err);

          resetScope();
          gotoStep('default');

          $scope.loading = false;
        }
      );
    };

    // Go to start page.
    gotoStep('default');
  }
]);
