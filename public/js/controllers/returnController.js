/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', [
  '$scope', '$controller', '$location', '$timeout', 'userService', 'receiptService', 'config',
  function ($scope, $controller, $location, $timeout, userService, receiptService, config) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('RFIDBaseController', {$scope: $scope});

    if (!config || !config.binSorting) {
      $scope.baseLogoutRedirect('/');
      return;
    }

    // Store raw check-in responses as it's need to print receipt.
    var raw_materials = [];

    // Used for offline storage.
    var currentDate = new Date().getTime();

    $scope.returnBins = config.binSorting.destinations;

    for (var bin in $scope.returnBins) {
      $scope.returnBins[bin].materials = [];
      $scope.returnBins[bin].pager = {
        itemsPerPage: 8,
        currentPage: 1
      };
    }

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

      // Restart idle timeout.
      $scope.baseResetIdleWatch();

      // Check if all tags in series have been added.
      if (!material.invalid && !material.loading && (!material.returned || material.status === 'return.error') && $scope.allTagsInSeries(material)) {
        // If a tag is missing from the device.
        if ($scope.anyTagRemoved(material.tags)) {
          material.tagRemoved = true;
          return;
        }

        // Set the material to loading.
        material.loading = true;

        userService.checkIn(material.id, currentDate).then(function (result) {
          $scope.baseResetIdleWatch();

          if (result) {
            if (result.ok === '1') {
              for (i = 0; i < $scope.materials.length; i++) {
                if ($scope.materials[i].id === result.itemIdentifier) {
                  $scope.materials[i].title = result.itemProperties.title;
                  $scope.materials[i].author = result.itemProperties.author;
                  $scope.materials[i].status = 'return.waiting_afi';
                  $scope.materials[i].information = 'return.is_awaiting_afi';
                  $scope.materials[i].sortBin = result.sortBin;

                  // Turn AFI on.
                  for (i = 0; i < material.tags.length; i++) {
                    $scope.setAFI(material.tags[i].uid, true);
                  }

                  // Store the raw result (it's used to send with receipts).
                  raw_materials.push(result);

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

          console.log("Return error", err);

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
      var material = $scope.updateMaterialAFI(tag);

      // If the tag belongs to a material in $scope.materials.
      if (material) {
        var allAFISetToTrue = true;

        // Iterate all tags in material.
        for (var i = 0; i < material.tags.length; i++) {
          if (!material.tags[i].afi) {
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

          var returnBin = getSortBin(material.sortBin);
          returnBin.materials.push(material);
        }
      }
    };

    /**
     * Get sort bin.
     *
     * @param bin
     *   @TODO: Missing documentation.
     *
     * @returns {*}
     *   @TODO: Missing documentation.
     */
    function getSortBin(bin) {
      if (config.binSorting.bins.hasOwnProperty(bin)) {
        return $scope.returnBins[config.binSorting.bins[bin]];
      }
      else {
        return $scope.returnBins[config.binSorting.default_bin];
      }
    }

    /**
     * Print receipt.
     */
    $scope.receipt = function receipt() {
      receiptService.returnReceipt(raw_materials, 'printer').then(
        function (status) {
          // Ignore.
        },
        function (err) {
          /// @TODO: Report error to user.
          console.log(err);
        }
      );

      // Always return to frontpage.
      $scope.baseLogoutRedirect();
    };

    // Check that interface methods are implemented.
    Interface.ensureImplements($scope, RFIDBaseInterface);

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
    });
  }
]);
