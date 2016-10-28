/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', ['$scope', '$controller', '$location', '$timeout', 'userService', 'receiptService', 'rfidService',
  function ($scope, $controller, $location, $timeout, userService, receiptService, rfidService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('RFIDBaseController', {$scope: $scope});

    // Store raw check-in responses as it's need to print receipt.
    var raw_materials = [];

    // Used for offline storage.
    var currentDate = new Date().getTime();

    $scope.materials = [];

    /**
     * Handle tag detected.
     *
     * Attempts to check-in the material if all part are available.
     *
     * @param tag
     *   The tag of material to check-in (return).
     */
    $scope.tagDetected = function tagDetected(tag) {
      var i;
      var material = $scope.addTag(tag, $scope.materials);

      // Check if all tags in series have been added.
      if (material.seriesLength === material.tags.length) {
        userService.checkIn(material.id, currentDate).then(function (result) {
          $scope.baseResetIdleWatch();

          // Store the raw result (it's used to send with receipts).
          raw_materials.push(result);

          if (result) {
            if (result.ok === '1') {
              for (i = 0; i < $scope.materials.length; i++) {
                if ($scope.materials[i].id === result.itemIdentifier) {
                  $scope.materials[i].title = result.itemProperties.title;
                  $scope.materials[i].author = result.itemProperties.author;
                  $scope.materials[i].status = 'return.waiting_afi';
                  $scope.materials[i].information = 'return.is_awaiting_afi';
                  $scope.materials[i].loading = false;

                  // Turn AFI on.
                  for (i = 0; i < material.tags.length; i++) {
                    $scope.setAFI(material.tags[i].UID, false);
                  }

                  break;
                }
              }
            }
            else {
              for (i = 0; i < $scope.materials.length; i++) {
                if ($scope.materials[i].id === result.itemIdentifier) {
                  $scope.materials[i].loading = false;
                  $scope.materials[i].information = result.screenMessage;
                  $scope.materials[i].status = 'return.error';

                  break;
                }
              }
            }
          }
          else {
            // @TODO: Handle error.
            console.log('result === false');
          }
        }, function (err) {
          // @TODO: what to do...
          console.log(err);
        });
      }
    };

    /**
     * Print receipt.
     */
    $scope.receipt = function receipt() {
      receiptService.returnReceipt(raw_materials, 'printer').then(
        function (status) {
          $scope.baseLogoutRedirect();
        },
        function (err) {
          /// @TODO: what to do...
          console.log(err);
        }
      );
    };

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      rfidService.stop();
    });
  }
]);
