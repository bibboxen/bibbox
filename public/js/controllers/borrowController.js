/**
 * @file
 * Borrow page controller.
 *
 * @extends RFIDBaseController
 * @implements RFIDBaseInterface
 */

angular.module('BibBox').controller('BorrowController', ['$scope', '$controller', '$location', '$timeout', 'userService', 'receiptService', '$modal', 'config', 'loggerService',
  function ($scope, $controller, $location, $timeout, userService, receiptService, $modal, config, loggerService) {
    'use strict';

    // Extend controller scope from the base controller.
    $controller('RFIDBaseController', { $scope: $scope });

    // @TODO: Move to base controller.
    if (!userService.userLoggedIn()) {
      $scope.baseLogoutRedirect('/');
      return;
    }

    // Display more than one book.
    $scope.imageDisplayMoreBooks = config.display_more_materials;

    $scope.loading = true;

    // Sets $scope.currentPatron to the current logged in patron.
    $scope.baseGetPatron();

    // Store raw check-in responses as it's need to print receipt.
    $scope.rawMaterials = [];

    // Contains the array of materials scanned.
    $scope.materials = [];

    // Keep track of borrowed materials.
    $scope.borrowedMaterials = [];

    // Materials that have been borrowed, but not been unlocked.
    $scope.lockedMaterials = [];

    // Pager config.
    $scope.pager = {
      itemsPerPage: 12,
      currentPage: 1
    };

    /**
     * Handle tag detected.
     *
     * Interface method implementation.
     *
     * @param tag
     *   The tag of the material to check-out (borrow).
     */
    $scope.tagDetected = function tagDetected(tag) {
      var material = $scope.addTag(tag, $scope.materials);

      // Restart idle timeout.
      $scope.baseResetIdleWatch();

      // If afi is awaiting being unlocked, and is placed on the device again.
      // Retry the unlocking.
      if (material.status === 'awaiting_afi') {
        material.loading = true;

        $scope.setAFI(tag.uid, false);

        return;
      }

      // Check if all tags in series have been added.
      if (!material.invalid && !material.loading && !material.success && $scope.allTagsInSeries(material)) {
        // If a tag is missing from the device, do not attempt to borrow the material.
        if ($scope.anyTagRemoved(material.tags)) {
          return;
        }

        // Set the material to loading.
        material.loading = true;

        // Attempt to borrow the material.
        userService.borrow(material.id).then(
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
              // If borrow was successful.
              if (result.ok === '1') {
                material.title = result.itemProperties.title;
                material.author = result.itemProperties.author;
                material.status = 'awaiting_afi';
                material.information = 'borrow.is_awaiting_afi';
                material.dueDate = result.dueDate;

                // Add to locked materials.
                $scope.lockedMaterials.push(material);

                // Turn AFI off.
                for (var i = 0; i < material.tags.length; i++) {
                  $scope.setAFI(material.tags[i].uid, false);
                }

                // If a tag is missing from the device show the locked materials pop-up.
                if ($scope.anyTagRemoved(material.tags)) {
                  tagMissingModal.$promise.then(tagMissingModal.show);

                  // Reset time to double time for users to has time to react.
                  $scope.baseResetIdleWatch(config.timeout.idleTimeout);
                }

                // Store the raw result (it's used to send with receipts).
                $scope.rawMaterials.push(result);
              }
              else {
                material.loading = false;
                material.information = result.screenMessage;
                material.status = 'error';

                if (result.itemProperties) {
                  material.title = result.itemProperties.title;
                  material.author = result.itemProperties.author;
                }
              }
            }
            else {
              material.status = 'error';
              material.information = 'borrow.was_not_successful';
              material.loading = false;
            }
          },
          function error(err) {
            $scope.baseResetIdleWatch();

            loggerService.error('Borrow error', err);

            for (var i = 0; i < $scope.materials.length; i++) {
              if ($scope.materials[i].id === material.id) {
                material = $scope.materials[i];

                material.status = 'error';
                material.information = 'borrow.was_not_successful';
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
     * Interface method implementation.
     *
     * @param tag
     *   The tag returned from the device.
     */
    $scope.tagAFISet = function itemAFISet(tag) {
      var material = $scope.updateMaterialAFI(tag);

      // If the tag belongs to a material in $scope.materials.
      if (material) {
        // Iterate all tags in material and return tag if afi is not false.
        var found = material.tags.find(function (tag) {
          return tag.afi === true || tag.afi === undefined;
        });

        // If all AFIs have been turned off mark the material as borrowed.
        if (!found) {
          // See if material was already added to borrowed materials.
          found = $scope.borrowedMaterials.find(function (item) {
            return item.id === material.id;
          });

          // Add to borrowed materials if not found.
          if (!found) {
            $scope.borrowedMaterials.push(material);

            // Update the pager to show latest result.
            $scope.pager.currentPage = Math.ceil($scope.borrowedMaterials.length / $scope.pager.itemsPerPage);
          }

          // Remove material from lockedMaterials, if there.
          var index = $scope.lockedMaterials.indexOf(material);
          if (index !== -1) {
            $scope.lockedMaterials.splice(index, 1);
          }

          material.status = 'success';
          material.information = 'borrow.was_successful';
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
     * Print receipt.
     *
     * @param type
     *   'mail' or 'printer'
     */
    $scope.receipt = function receipt(type) {
      var credentials = userService.getCredentials();

      // Raw materials contains all loaned in the library system (also those who
      // have failed AFI sets, as they are still loaned in LMS)
      receiptService.borrow(credentials.username, credentials.password, $scope.rawMaterials, type).then(
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
     * Show the receipt modal.
     */
    $scope.showReceiptModal = function showReceiptModal() {
      receiptModal.$promise.then(receiptModal.show);
    };

    /**
     * Setup receipt modal.
     */
    var receiptModal = $modal({
      scope: $scope,
      templateUrl: './views/modal_receipt.html',
      show: false
    });

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

    /**
     * On destroy.
     *
     * Log out of user service.
     * Stop listening for barcode.
     */
    $scope.$on('$destroy', function () {
      userService.logout();
      receiptModal.$promise.then(receiptModal.hide);
      processingModal.$promise.then(processingModal.hide);
      tagMissingModal.$promise.then(tagMissingModal.hide);
    });
  }
]);
