/**
 * Reservations page controller.
 */
angular.module('BibBox').controller('ReservationsController', ['$scope', 'userService',
  function($scope, userService) {
    "use strict";

    $scope.materials = [];

    userService.patron().then(
      function (patron) {
        console.log(patron);

        if (patron) {
          for (var i = 0; i < patron.unavailableHoldItems.length; i++) {
            var item = angular.copy(patron.unavailableHoldItems[i]);

            item.reservationNumber = "? 1 ?";
            item.ready = false;

            $scope.materials.push(item);
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  }
]);
