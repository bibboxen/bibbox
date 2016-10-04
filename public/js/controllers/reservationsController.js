/**
 * Reservations page controller.
 */
angular.module('BibBox').controller('ReservationsController', ['$scope', '$location', 'userService',
  function($scope, $location, userService) {
    "use strict";

    if (!userService.userLoggedIn()) {
      $location.path('/');
      return;
    }

    $scope.materials = [];

    userService.patron().then(
      function (patron) {
        console.log(patron);

        // If patron exists, get reservations.
        if (patron) {
          var i, item;

          // Add available items
          for (i = 0; i < patron.holdItems.length; i++) {
            item = angular.copy(patron.holdItems[i]);

            item.ready = true;

            // Remove ID from pickup location string.
            var pickupSplit = item.pickupLocation.split(' - ');
            if (pickupSplit.length > 0) {
              item.pickupLocation = pickupSplit[1];
            }

            $scope.materials.push(item);
          }

          // Add unavailable items
          for (i = 0; i < patron.unavailableHoldItems.length; i++) {
            item = angular.copy(patron.unavailableHoldItems[i]);

            item.reservationNumber = "?";
            item.ready = false;

            $scope.materials.push(item);
          }
        }
        else {
          // @TODO: Report error.
          console.log(err);
        }
      },
      function (err) {
        // @TODO: Report error.
        console.log(err);
      }
    );

    /**
     * Print receipt.
     */
    $scope.receipt = function receipt() {
      alert('Not supported yet!');
    };

    /**
     * Goto to front page.
     */
    $scope.gotoFront = function gotoFront() {
      userService.logout();
      $location.path('/');
    };

    /**
     * On destroy.
     *
     * Log out of user service.
     */
    $scope.$on("$destroy", function() {
      userService.logout();
    });
  }
]);
