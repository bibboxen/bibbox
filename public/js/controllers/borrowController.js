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
     * @param {object} rawTag
     *   The tag of the material to check-out (borrow).
     */
    $scope.tagDetected = function tagDetected(rawTag) {
      var tag = JSON.parse(JSON.stringify(rawTag));

      // Restart idle timeout.
      $scope.baseResetIdleWatch();

      if (!$scope.tagValid(tag)) {
        return;
      }

      var material = $scope.addTag(tag, $scope.materials);

      // If afi is awaiting being unlocked, and is placed on the device again.
      // Retry the unlocking.
      if (material.status === 'awaiting_afi') {
        material.loading = true;

        // Retry setting tag afi if not set to false.
        if (tag.afi !== false) {
          $scope.setAFI(tag.uid, false);
        }
        else {
          $scope.tagAFISet(tag);
        }

        return;
      }
      else if (material.status !== 'error') {
        // Always un-lock tag, will re-lock if loan fails. The unlock don't always work, so this is kind of an hack. We
        // want to always unlock to prevent false alarms if the unlock after the loan don't succeed correctly.
        // Do not perform this action when the material has reported error.
        if (tag.afi !== false) {
          $scope.setAFI(tag.uid, false);
        }
      }
      else {
        // Error case.
        if (tag.afi !== true) {
          $scope.setAFI(tag.uid, true);
        }
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
                material.offline = result.offline;
                material.borrowed = true;

                // Add to locked materials.
                $scope.lockedMaterials.push(material);

                // If a tag is missing from the device check missing tags.
                if ($scope.anyTagRemoved(material.tags)) {
                  $scope.checkMissingTags();
                }

                // Store the raw result (it's used to send with receipts).
                $scope.rawMaterials.push(result);

                // Turn AFI off for materials that have not been set correctly yet.
                for (var i = 0; i < material.tags.length; i++) {
                  if (material.tags[i].afi !== false) {
                    $scope.setAFI(material.tags[i].uid, false);
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
                material.borrowed = false;

                // Loan failed, so lets lock the tags again.
                for (var i = 0; i < material.tags.length; i++) {
                  $scope.setAFI(material.tags[i].uid, true);
                }

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
              material.borrowed = false;

              // Loan failed, so lets lock the tags again.
              for (var i = 0; i < material.tags.length; i++) {
                $scope.setAFI(material.tags[i].uid, true);
              }
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
                material.borrowed = false;

                // Loan failed, so lets lock the tags again.
                for (var i = 0; i < material.tags.length; i++) {
                  $scope.setAFI(material.tags[i].uid, true);
                }

                break;
              }
            }
          }
        ).then(function () {
          $scope.baseResetIdleWatch();
        });
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

      if (!$scope.tagValid(tag)) {
        return;
      }

      // Check if material has already been added to the list.
      var material = $scope.materials.find(function (material) {
        return material.id === tag.mid;
      });

      // If the material has not been added, ignore it.
      if (!material) {
        return;
      }

      // Find tag.
      var materialTag = material.tags.find(function (findTag) {
        return findTag.uid === tag.uid;
      });

      // If the tag is found, mark it as removed.
      if (materialTag) {
        materialTag.removed = true;
      }

      $scope.checkMissingTags();
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
      if (!$scope.tagValid(tag)) {
        return;
      }

      var material = $scope.updateMaterialAFI(tag);

      // If the tag belongs to a material in $scope.materials and processed material (backend have processed it).
      if (material && material.hasOwnProperty('borrowed') && material.borrowed) {
        var allAccepted = $scope.allTagsInSeriesSetCorrect(material.tags, false, material.seriesLength);

        // If all AFIs have been turned off mark the material as returned.
        if (allAccepted) {
          // See if material was already added to borrowed materials.
          var found = $scope.borrowedMaterials.find(function (item) {
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

      $scope.checkMissingTags();
    };

    /**
     * RFID Error handler.
     *
     * If there was an error unlocking the AFI, retry.
     *
     * Interface method implementation.
     *
     * @param err
     */
    $scope.rfidError = function rfidError(err) {
      loggerService.error('RFID error', err);

      if (err.hasOwnProperty('type') && err.type === 'tag.set') {
        // Retry unlocking AFI.
        $scope.setAFI(err.tag.uid, false);
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
      $modal({
        scope: $scope,
        templateUrl: './views/modal_receipt.html',
        show: true,
        onHide: function (modal) {
          modal.destroy();
        }
      });
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
    });
  }
]);
