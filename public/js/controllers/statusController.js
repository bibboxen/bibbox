/**
 * Status page controller.
 */
angular.module('BibBox').controller('StatusController', ['$scope', 'userService',
  function($scope, userService) {
    "use strict";


    $scope.materials = [];

    userService.patron().then(
      function (patron) {
        console.log(patron);

        if (patron) {
          for (var i = 0; i < patron.chargedItems.length; i++) {
            var item = angular.copy(patron.chargedItems[i]);
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
