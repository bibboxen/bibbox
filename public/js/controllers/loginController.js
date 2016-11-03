/**
 * Status page controller.
 */
angular.module('BibBox').controller('LoginController', ['$scope', '$controller', '$http', '$window', '$location', '$routeParams', 'userService', 'barcodeService',
  function ($scope, $controller, $http, $window, $location, $routeParams, userService, barcodeService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

    var usernameRegExp = /^\d+$/;
    var passwordRegExp = /^\d+$/;

    $scope.display = 'start';
    $scope.loading = false;

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

      $scope.invalidLoginErrorMessage = 'Unknown login error';
      $scope.invalidLoginError = false;
      $scope.passwordValidationError = false;
      $scope.usernameValidationError = false;
    };
    resetScope();

    /**
     * Sets the $scope.display variable.
     *
     * @param step
     *   The step in the login process.
     *   Values: (start, username, password)
     */
    var gotoStep = function (step) {
      $scope.display = step;
    };

    /**
     * Use manual login.
     *
     * @param {boolean} useManual
     *   Should manual login be used?
     */
    $scope.useManualLogin = function useManualLogin(useManual) {
      resetScope();

      if (useManual) {
        gotoStep('username');
      }
      else {
        gotoStep('start');
      }
    };

    /**
     * Handle back button.
     */
    $scope.back = function back() {
      if ($scope.display === 'start') {
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
            $location.path('/' + $routeParams.redirectUrl);
          }
          else {
            resetScope();
            gotoStep('start');

            $scope.invalidLoginError = true;
            $scope.loading = false;
          }
        },
        function error(err) {
          $scope.baseResetIdleWatch();

          resetScope();
          gotoStep('start');

          $scope.invalidLoginErrorMessage = err.message;
          $scope.invalidLoginError = true;
          $scope.loading = false;
        }
      );
    };

    /**
     * Barcode result handler.
     *
     * @param event
     *   The event.
     * @param data
     *   The barcode scanned.
     */
    $scope.$on('barcodeScanned', function barcodeScanned(event, data) {
      if ($scope.display === 'start') {
        $scope.user.username = data;
        $scope.usernameEntered();
      }
    });

    /**
     * Barcode error handler.
     *
     * @param event
     *   The event.
     * @param err
     *   The error thrown.
     */
    $scope.$on('barcodeError', function barcodeError(event, err) {
      // @TODO: inform user that barcode as failed and switch to manual.
      console.log('barcodeError', event, err);
    });

    // Start listen to barcode events.
    barcodeService.start($scope);

    // Go to start page.
    gotoStep('start');

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      barcodeService.stop();
    });
  }
]);
