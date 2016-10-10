/**
 * Reservations page controller.
 */
angular.module('BibBox').controller('ReservationsController', ['$scope', '$location', '$timeout', 'userService',
  function($scope, $location, $timeout, userService) {
    "use strict";

    $scope.loading = true;

    if (!userService.userLoggedIn()) {
      $location.path('/');
      return;
    }

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

    $scope.materials = [];

    userService.patron().then(
      function (patron) {
        $scope.loading = false;

        console.log(patron);

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
        $scope.loading = false;
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
