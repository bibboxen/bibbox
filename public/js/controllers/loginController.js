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

    $scope.display = 'default';
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
     *   Values: (default, username, password)
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

          console.error('login error: ', err);

          resetScope();
          gotoStep('default');

          $scope.invalidLoginError = true;
          $scope.loading = false;
        }
      );
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

    // Start listen to barcode events.
    barcodeService.start($scope);

    // Go to start page.
    gotoStep('default');

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      barcodeService.stop();
    });
  }
]);
