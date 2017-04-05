/**
 * @file
 * Return page controller.
 *
 * @extends RFIDBaseController
 * @implements RFIDBaseInterface
 */

angular.module('BibBox').controller('ReturnController', ['$scope', '$controller', '$location', '$timeout', 'userService', 'receiptService', 'config', '$modal', 'loggerService',
  function ($scope, $controller, $location, $timeout, userService, receiptService, config, $modal, loggerService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('RFIDBaseController', {$scope: $scope});

    if (!config || !config.binSorting) {
      $scope.baseLogoutRedirect('/');
      return;
    }

    // Used for offline storage.
    var currentDate = new Date().getTime();

    // Used to disable multi clicks on receipt button.
    $scope.disabledReceiptBtn = false;

    // Display more than one book.
    $scope.imageDisplayMoreBooks = config.display_more_materials;

    // Store raw check-in responses as it's need to print receipt.
    $scope.rawMaterials = {};

    // Materials that have been borrowed, but not been unlocked.
    $scope.lockedMaterials = [];

    // Get the return bins.
    $scope.returnBins = config.binSorting.destinations;

    // Setup bins.
    for (var bin in $scope.returnBins) {
      $scope.returnBins[bin].materials = [];
      $scope.returnBins[bin].pager = {
        itemsPerPage: 11,
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
      var material = $scope.addTag(tag, $scope.materials);

      // Restart idle timeout.
      $scope.baseResetIdleWatch();

      // If afi is awaiting being locked, and is placed on the device again.
      // Retry the locking.
      if (material.status === 'awaiting_afi') {
        material.loading = true;

        // Retry setting tag afi if not set to true.
        if (tag.afi !== true) {
          $scope.setAFI(tag.uid, true);
        }
        else {
          $scope.tagAFISet(tag);
        }

        return;
      }

      // Check if all tags in series have been added.
      if (!material.invalid && !material.loading && !material.success && $scope.allTagsInSeries(material)) {
        // If a tag is missing from the device, do not attempt to return the material.
        if ($scope.anyTagRemoved(material.tags)) {
          return;
        }

        // Set the material to loading.
        material.loading = true;

        // Attempt to return the material.
        userService.checkIn(material.id, currentDate).then(
          function success(result) {
            $scope.baseResetIdleWatch();

            // Find material.
            var material = $scope.materials.find(function (material) {
              return material.id === result.itemIdentifier;
            });

            // If it is not found, ignore it.
            if (!material) {
              return;
            }

            // Check that the result exists.
            if (result) {
              // If the return was successful.
              if (result.ok === '1') {
                material.title = result.itemProperties.title;
                material.author = result.itemProperties.author;
                material.status = 'awaiting_afi';
                material.information = 'return.is_awaiting_afi';
                material.sortBin = result.sortBin;

                // Add to locked materials.
                $scope.lockedMaterials.push(material);

                // Store the raw result (it's used to send with receipts).
                if (result.hasOwnProperty('patronIdentifier')) {
                  if (!$scope.rawMaterials.hasOwnProperty(result.patronIdentifier)) {
                    $scope.rawMaterials[result.patronIdentifier] = [];
                  }

                  $scope.rawMaterials[result.patronIdentifier].push(result);
                }
                else {
                  if (!$scope.rawMaterials.hasOwnProperty('unknown')) {
                    $scope.rawMaterials.unknown = [];
                  }
                  $scope.rawMaterials.unknown.push(result);
                }

                // If a tag is missing from the device show the unlocked materials pop-up.
                if ($scope.anyTagRemoved(material.tags)) {
                  // Reset time to double time for users to has time to react.
                  $scope.baseResetIdleWatch(config.timeout.idleTimeout);

                  tagMissingModal.$promise.then(tagMissingModal.show);
                }

                // Turn AFI on for materials that have not been set correctly yet.
                for (var i = 0; i < material.tags.length; i++) {
                  if (material.tags[i].afi !== true) {
                    $scope.setAFI(material.tags[i].uid, true);
                  }
                  else {
                    $scope.tagAFISet(material.tags[i]);
                  }
                }
              }
              else {
                material.loading = false;
                material.information = result.screenMessage;
                material.status = 'error';
              }
            }
            else {
              material.status = 'error';
              material.information = 'return.was_not_successful';
              material.loading = false;
            }
          },
          function error(err) {
            $scope.baseResetIdleWatch();

            loggerService.error('Check-in: ' + err);

            for (var i = 0; i < $scope.materials.length; i++) {
              if ($scope.materials[i].id === material.id) {
                material = $scope.materials[i];

                material.status = 'error';
                material.information = 'return.was_not_successful';
                material.loading = false;

                break;
              }
            }
          }
        );
      }
    };

    /**
     * Tag was removed from RFID device.
     *
     * @param tag
     */
    $scope.tagRemoved = function itemRemoved(tag) {
      // Restart idle timeout.
      $scope.baseResetIdleWatch();

      // Check if material has already been added to the list.
      var material = $scope.materials.find(function (material) {
        return material.id === tag.mid;
      });

      // If the material has not been added, ignore it.
      if (!material) {
        return;
      }

      // Mark tag as removed from the scanner.
      var materialTag = material.tags.find(function (tag) {
        return tag.uid === tag.uid;
      });

      // If the tag is found, mark it as removed.
      if (materialTag) {
        materialTag.removed = true;
      }

      if (material.status === 'awaiting_afi') {
        tagMissingModal.$promise.then(tagMissingModal.show);

        // Reset time to double time for users to has time to react.
        $scope.baseResetIdleWatch(config.timeout.idleTimeout);
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
        var allAccepted = $scope.allTagsInSeriesSetCorrect(material.tags, true, material.seriesLength);

        // If all AFIs have been turned on mark the material as returned.
        if (allAccepted) {
          // Place the material in the correct sorting bin.
          var returnBin = getSortBin(material.sortBin);

          // See if material was already added to borrowed materials.
          var found = returnBin.materials.find(function (item) {
            return item.id === material.id;
          });

          // Add to material to return bin.
          if (!found) {
            returnBin.materials.push(material);

            // Update the pager to show latest result.
            returnBin.pager.currentPage = Math.ceil(returnBin.materials.length / returnBin.pager.itemsPerPage);
          }

          // Remove material from lockedMaterials, if there.
          var index = $scope.lockedMaterials.indexOf(material);
          if (index !== -1) {
            $scope.lockedMaterials.splice(index, 1);
          }

          material.status = 'success';
          material.information = 'return.was_successful';
          material.loading = false;
          material.success = true;
        }
      }

      // Remove tagMissingModal if no materials are locked.
      if ($scope.lockedMaterials.length <= 0) {
        tagMissingModal.$promise.then(tagMissingModal.hide);
      }
    };

    /**
     * RFID Error handler.
     *
     * If there was an error locking the AFI, retry.
     *
     * Interface method implementation.
     *
     * @param err
     */
    $scope.rfidError = function rfidError(err) {
      loggerService.error('RFID error', err);

      if (err.hasOwnProperty('type') && err.type === 'tag.set') {
        // Retry locking AFI.
        $scope.setAFI(err.tag.uid, true);
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
     * Has the user borrowed a material?
     *
     * @return {boolean}
     */
    $scope.hasBorrowedMaterial = function hasBorrowedMaterial() {
      for (var entry in $scope.rawMaterials) {
        if (entry.length > 0) {
          return true;
        }
      }
      return false;
    };

    /**
     * Handle receipt.
     *
     * Check if the material returned users has an mail address if all users has
     * a mail address display send mail as well as print receipt button.
     *
     * If one or more user is unknown or don't have a mail address only print
     * the receipt.
     */
    $scope.showReceiptModal = function showReceiptModal() {
      // Disable the receipt button until requests to the backend has completed
      // or modal is closed.
      $scope.disabledReceiptBtn = true;

      var patronIdentifiers = Object.getOwnPropertyNames($scope.rawMaterials);
      receiptService.getPatronsInformation(patronIdentifiers).then(
        function (patronsInformation) {

          // Enrich the raw materials with the patron information.
          $scope.rawMaterials.patronsInformation = patronsInformation;

          // Check if all mail addresses exists; if not print the receipt and
          // exit.
          for (var patronIdentifier in patronsInformation) {
            if (!patronsInformation[patronIdentifier].emailAddress) {
              $scope.receipt('printer');
              return;
            }
          }

          $modal({
            scope: $scope,
            templateUrl: './views/modal_receipt.html',
            show: true,
            onHide: function (modal) {
              // Re-enable receipt button.
              $scope.disabledReceiptBtn = false;
              modal.destroy();
            }
          });
        },
        function (err) {
          // Re-enable receipt button.
          $scope.disabledReceiptBtn = false;
          loggerService.error(err);
        }
      );
    };

    /**
     * Print/send receipt.
     *
     * @param type
     *   'mail' or 'printer'
     */
    $scope.receipt = function receipt(type) {
      // Raw materials contains all loaned in the library system (also those who
      // have failed AFI sets, as they are still loaned in LMS)
      receiptService.returnReceipt($scope.rawMaterials, type).then(
        function (status) {
          // Ignore.
        },
        function (err) {
          loggerService.error(err);
        }
      );

      // Always return to front page.
      $scope.baseLogoutRedirect();
    };

    /**
     * Show the processing modal.
     */
    $scope.showProcessingModal = function showProcessingModal() {
      $modal({
        scope: $scope,
        templateUrl: './views/modal_processing.html',
        show: true,
        onHide: function (modal) {
          modal.destroy();
        }
      });
    };

    /**
     * Setup tag missing modal.
     *
     * Has a locked backdrop, that does not disappear when clicked.
     */
    var tagMissingModal = $modal({
      scope: $scope,
      templateUrl: './views/modal_tag_missing.html',
      show: false,
      backdrop: 'static'
    });

    // Check that interface methods are implemented.
    Interface.ensureImplements($scope, RFIDBaseInterface);
  }
]);
