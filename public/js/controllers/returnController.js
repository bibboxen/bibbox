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
     * Attempts to check-in the material if all part are available and on device.
     *
     * @param tag
     *   The tag of material to check-in (return).
     */
    $scope.tagDetected = function tagDetected(tag) {
      var i;
      var material = $scope.addTag(tag, $scope.materials);

      // Check if all tags in series have been added.
      if (!material.invalid && !material.loading && !material.returned && $scope.allTagsInSeries(material)) {
        // If a tag is missing from the device.
        if ($scope.anyTagRemoved(material.tags)) {
          material.tagRemoved = true;
          return;
        }

        // Set the material to loading.
        material.loading = true;

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

                  // Turn AFI on.
                  for (i = 0; i < material.tags.length; i++) {
                    $scope.setAFI(material.tags[i].UID, true);
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
            for (i = 0; i < $scope.materials.length; i++) {
              if ($scope.materials[i].id === material.id) {
                $scope.materials[i].status = 'return.error';
                $scope.materials[i].information = 'return.was_not_successful';
                $scope.materials[i].loading = false;

                // @TODO: How can this be retried?

                break;
              }
            }
          }
        }, function (err) {
          $scope.baseResetIdleWatch();
          
          console.log(err);

          for (i = 0; i < $scope.materials.length; i++) {
            if ($scope.materials[i].id === material.id) {
              $scope.materials[i].status = 'return.error';
              $scope.materials[i].information = 'return.was_not_successful';
              $scope.materials[i].loading = false;

              // @TODO: How can this be retried?

              break;
            }
          }
        });
      }
    };

    /**
     * Tag AFI has been set.
     *
     * Called from RFIDBaseController.
     *
     * @param tag
     *   The tag returned from the device.
     */
    $scope.tagAFISet = function itemAFISet(tag) {
      var material = $scope.setAFIonTagReturnMaterial(tag);

      // If the tag belongs to a material in $scope.materials.
      if (material) {
        var allAFISetToTrue = true;

        // Iterate all tags in material.
        for (var i = 0; i < material.tags.length; i++) {
          if (!material.tags[i].AFI) {
            allAFISetToTrue = false;
            break;
          }
        }

        // If all AFIs have been turned off mark the material as returned.
        if (allAFISetToTrue) {
          material.status = 'return.success';
          material.information = 'return.was_successful';
          material.loading = false;
          material.returned = true;
        }
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
    $scope.$on('$destroy', function () {});
  }
]);
