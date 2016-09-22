/**
 * Status page controller.
 */
angular.module('BibBox').controller('StatusController', ['$scope', 'userService',
  function($scope, userService) {
    "use strict";

    $scope.materials = [];

    userService.patron().then(
      function (patron) {
        // If patron exists, get all charged, overdue and recall items
        if (patron) {
          var i, item;

          // Add charged items
          for (i = 0; i < patron.chargedItems.length; i++) {
            item = angular.copy(patron.chargedItems[i]);
            $scope.materials.push(item);
          }

          // Add overdue items
          for (i = 0; i < patron.overdueItems.length; i++) {
            item = angular.copy(patron.overdueItems[i]);
            $scope.materials.push(item);
          }

          // Add recall items
          for (i = 0; i < patron.recallItems.length; i++) {
            item = angular.copy(patron.recallItems[i]);
            $scope.materials.push(item);
          }
        }
        else {
          // @TODO: Report error
          console.log(err);
        }
      },
      function (err) {
        // @TODO: Report error
        console.log(err);
      }
    );
  }
]);
