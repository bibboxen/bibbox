/**
 * Reservations page controller.
 */
angular.module('BibBox').controller('ReservationsController', ['$scope', 'userService',
  function($scope, userService) {
    "use strict";

    $scope.materials = [];

    userService.patron().then(
      function (patron) {
        // If patron exists, get reservations.
        if (patron) {
          var i, item;

          // Add available items
          for (i = 0; i < patron.holdItems.length; i++) {
            item = angular.copy(patron.holdItems[i]);

            item.ready = true;

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
  }
]);
