/**
 * Status page controller.
 */
angular.module('BibBox').controller('StatusController', ['$scope', '$location', '$translate', 'userService',
  function($scope, $location, $translate, userService) {
    "use strict";

    // Check that the user is logged in.
    if (!userService.userLoggedIn()) {
      $location.path('/');
      return;
    }

    $scope.materials = [];
    $scope.fineItems = [];
    $scope.currentPatron = null;

    // Load materials for currrent user.
    userService.patron().then(
      function (patron) {
        console.log(patron);

        $scope.currentPatron = patron;

        $scope.fineItems = patron.fineItems;

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

          // Add fines to items.
          for (i = 0; i < patron.fineItems.length; i++) {
            for (var j = 0; j < $scope.materials.length; j++) {
              if ($scope.materials[j].id === patron.fineItems[i].id) {
                $scope.materials[j].fineItem = patron.fineItems[i];
                break;
              }
            }
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

    /**
     * Renew a material.
     *
     * @param material
     */
    $scope.renew = function renew(material) {
      userService.renew(material.id).then(
        function success(data) {
          console.log(data);

          if (data.renewalOk === 'Y') {
            material.newDate = data.dueDate;
            material.information = "status.renew.ok";
          }
          else {
            material.information = data.screenMessage;
          }
        },
        function error(err) {
          console.log(err);
        }
      );
    };

    /**
     * Renew all materials.
     */
    $scope.renewAll = function renewAll() {
      userService.renewAll().then(
        function success(data) {
          console.log(data);

          if (data.ok === '1') {
            // Update renewed items.
            if (data.renewedItems !== null) {
              for (var i = 0; i < data.renewedItems; i++) {
                for (var material in $scope.materials) {
                  material = $scope.materials[material];

                  if (material.id === data.renewedItems[i].id) {
                    material.information = 'status.renew.ok';
                    material.renewed = true;
                    break;
                  }
                }
              }
            }

            // Update unrenewed items.
            if (data.unrenewedItems !== null) {
              for (var i = 0; i < data.unrenewedItems.length; i++) {
                for (var material in $scope.materials) {
                  material = $scope.materials[material];

                  if (material.id === data.unrenewedItems[i].id) {
                    material.information = data.unrenewedItems[i].reason;
                    material.renewed = false;
                    break;
                  }
                }
              }
            }
          }
          else {
            console.log("not ok");
          }
        },
        function error(err) {
          console.log(err);
        }
      );
    };

    /**
     * Print receipt.
     *
     * @param type
     *   'mail' or 'printer'
     */
    $scope.receipt = function receipt(type) {
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
