/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', [
  '$scope', '$controller', '$location', '$timeout', 'userService', 'receiptService', 'config', '$modal',
  function ($scope, $controller, $location, $timeout, userService, receiptService, config, $modal) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('RFIDBaseController', {$scope: $scope});

    if (!config || !config.binSorting) {
      $scope.baseLogoutRedirect('/');
      return;
    }

    // Display more than one book.
    $scope.imageDisplayMoreBooks = config.display_more_materials;

    // Store raw check-in responses as it's need to print receipt.
    var raw_materials = {};

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
      if (!material.invalid && !material.loading && (!material.success || material.status === 'error') && $scope.allTagsInSeries(material)) {
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
                  $scope.materials[i].status = 'awaiting_afi';
                  $scope.materials[i].information = 'return.is_awaiting_afi';
                  $scope.materials[i].sortBin = result.sortBin;

                  // Place the material in the correct sorting bin.
                  var returnBin = getSortBin(material.sortBin);

                  // See if material was already added to borrowed materials.
                  var found = returnBin.materials.find(function (item, index) {
                    return item.id === material.id;
                  });

                  // Add to material to return bin.
                  if (!found) {
                    returnBin.materials.push(material);

                    // Update the pager to show latest result.
                    returnBin.pager.currentPage = Math.ceil(returnBin.materials.length / returnBin.pager.itemsPerPage);
                  }

                  // Turn AFI on.
                  for (i = 0; i < material.tags.length; i++) {
                    $scope.setAFI(material.tags[i].uid, true);
                  }

                  // Store the raw result (it's used to send with receipts).
                  if (result.hasOwnProperty('patronIdentifier')) {
                    if (!raw_materials.hasOwnProperty('patronIdentifier')) {
                      raw_materials[result.patronIdentifier] = [];
                    }

                    raw_materials[result.patronIdentifier].push(result);
                  }
                  else {
                    if (!raw_materials.hasOwnProperty('unknown')) {
                      raw_materials.unknown = [];
                    }
                    raw_materials.unknown.push(result);
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
                  $scope.materials[i].status = 'error';

                  break;
                }
              }
            }
          }
          else {
            for (i = 0; i < $scope.materials.length; i++) {
              if ($scope.materials[i].id === material.id) {
                $scope.materials[i].status = 'error';
                $scope.materials[i].information = 'return.was_not_successful';
                $scope.materials[i].loading = false;
                break;
              }
            }
          }
        }, function (err) {
          $scope.baseResetIdleWatch();
          for (i = 0; i < $scope.materials.length; i++) {
            if ($scope.materials[i].id === material.id) {
              $scope.materials[i].status = 'error';
              $scope.materials[i].information = 'return.was_not_successful';
              $scope.materials[i].loading = false;
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
        // Iterate all tags in material and return tag if afi is false.
        var found = material.tags.find(function (tag, index) {
          return !tag.afi;
        });

        // If all AFIs have been turned on mark the material as borrowed.
        if (!found) {
          material.status = 'success';
          material.information = 'return.was_successful';
          material.loading = false;
          material.success = true;
        }
      }
    };

    /**
     * Get sort bin.
     *
     * @param {string} bin
     *   The bin number.
     *
     * @returns {*}
     *   The bin the material should be added to.
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
      // Raw materials contains all loaned in the library system (also those who
      // have failed AFI sets, as they are still loaned in LMS)
      receiptService.returnReceipt(raw_materials, 'printer').then(
        function (status) {
          // Ignore.
        },
        function (err) {
          // @TODO: Report error to user.
          console.log(err);
        }
      );

      // Always return to front page.
      $scope.baseLogoutRedirect();
    };

    /**
     * Show the processing modal.
     */
    $scope.showProcessingModal = function showProcessingModal() {
      processingModal.$promise.then(processingModal.show);
    };

    /**
     * Setup processing modal.
     */
    var processingModal = $modal({
      scope: $scope,
      templateUrl: './views/modal_processing.html',
      show: false
    });

    // Check that interface methods are implemented.
    Interface.ensureImplements($scope, RFIDBaseInterface);

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      processingModal.hide();
    });
  }
]);
