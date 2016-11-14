/**
 * Reservations page controller.
 */
angular.module('BibBox').controller('ReservationsController', ['$scope', '$controller', '$location', '$timeout', 'userService', 'Idle', 'receiptService', '$modal',
  function ($scope, $controller, $location, $timeout, userService, Idle, receiptService, $modal) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

    $scope.loading = true;

    // @TODO: Move to base controller.
    if (!userService.userLoggedIn()) {
      $scope.baseLogoutRedirect();
      return;
    }

    $scope.materials = [];

    // Sets $scope.currentPatron to the current logged in patron.
    $scope.baseGetPatron().then(function () {
      var i;
      var item;

      // Add available items.
      if ($scope.currentPatron.hasOwnProperty('holdItems')) {
        for (i = 0; i < $scope.currentPatron.holdItems.length; i++) {
          item = angular.copy($scope.currentPatron.holdItems[i]);

          item.ready = true;

          $scope.materials.push(item);
        }
      }

      // Add unavailable items.
      if ($scope.currentPatron.hasOwnProperty('unavailableHoldItems')) {
        for (i = 0; i < $scope.currentPatron.unavailableHoldItems.length; i++) {
          item = angular.copy($scope.currentPatron.unavailableHoldItems[i]);

          item.reservationNumber = '?';
          item.ready = false;

          $scope.materials.push(item);
        }
      }
    }, function (err) {
      // @TODO: what to do...
      console.log(err);
    });

    /**
     * Setup receipt modal.
     */
    var receiptModal = $modal({
      scope: $scope,
      templateUrl: './views/modal_receipt.html',
      show: false
    });
    $scope.showReceiptModal = function showReceiptModal() {
      receiptModal.$promise.then(receiptModal.show);
    };

    /**
     * Print receipt.
     */
    $scope.receipt = function receipt(type) {
      var credentials = userService.getCredentials();

      receiptService.reservations(credentials.username, credentials.password, type).then(
        function (status) {
          // Ignore.
        },
        function (err) {
          // @TODO: what to do...
          console.log(err);
        }
      );

      // Always return to frontpage.
      $scope.baseLogoutRedirect();
    };

    /**
     * On destroy.
     *
     * Log out of user service.
     */
    $scope.$on('$destroy', function () {
      receiptModal.hide();
    });
  }
]);
