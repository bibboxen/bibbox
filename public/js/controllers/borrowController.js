/**
 * @file
 * Borrow page controller.
 *
 * @extends RFIDBaseController
 * @implements RFIDBaseInterface
 */
angular.module('BibBox').controller('BorrowController', ['$scope', '$controller', '$location', '$timeout', 'userService', 'receiptService', '$modal',
  function ($scope, $controller, $location, $timeout, userService, receiptService, $modal) {
    'use strict';

    // Extend controller scope from the base controller.
    $controller('RFIDBaseController', { $scope: $scope });

    // @TODO: Move to base controller.
    if (!userService.userLoggedIn()) {
      $scope.baseLogoutRedirect('/');
      return;
    }

    $scope.loading = true;

    // Sets $scope.currentPatron to the current logged in patron.
    $scope.baseGetPatron();

    // Store raw check-in responses as it's need to print receipt.
    var raw_materials = [];

    /**
     * Contains the array of materials scanned.
     *
     * @type {Array}
     */
    $scope.materials = [];

    /**
     * Keep track of borrowed materials.
     *
     * @type {Array}
     */
    $scope.borrowedMaterials = [];

    // Pager config.
    $scope.pager = {
      itemsPerPage: 10,
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
      var i;
      var material = $scope.addTag(tag, $scope.materials);

      // Restart idle timeout.
      $scope.baseResetIdleWatch();

      // Check if all tags in series have been added.
      if (!material.invalid && !material.loading && (!material.borrowed || material.status === 'return.error') && $scope.allTagsInSeries(material)) {
        // If a tag is missing from the device.
        if ($scope.anyTagRemoved(material.tags)) {
          material.tagRemoved = true;
          return;
        }

        // Set the material to loading.
        material.loading = true;

        // Attempt to borrow material.
        userService.borrow(material.id).then(
          function success(result) {
            $scope.baseResetIdleWatch();

            if (result) {
              if (result.ok === '1') {
                for (i = 0; i < $scope.materials.length; i++) {
                  if ($scope.materials[i].id === result.itemIdentifier) {
                    $scope.materials[i].title = result.itemProperties.title;
                    $scope.materials[i].author = result.itemProperties.author;
                    $scope.materials[i].status = 'borrow.awaiting_afi';
                    $scope.materials[i].information = 'borrow.is_awaiting_afi';
                    $scope.materials[i].dueDate = result.dueDate;
                    $scope.materials[i].borrowed = true;

                    // Turn AFI off.
                    for (i = 0; i < material.tags.length; i++) {
                      $scope.setAFI(material.tags[i].uid, false);
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
                    $scope.materials[i].status = 'borrow.error';

                    if (result.itemProperties) {
                      $scope.materials[i].title = result.itemProperties.title;
                      $scope.materials[i].author = result.itemProperties.author;
                    }

                    break;
                  }
                }
              }
            }
            else {
              for (i = 0; i < $scope.materials.length; i++) {
                if ($scope.materials[i].id === material.id) {
                  $scope.materials[i].status = 'borrow.error';
                  $scope.materials[i].information = 'borrow.was_not_successful';
                  $scope.materials[i].loading = false;

                  // @TODO: How can this be retried?

                  break;
                }
              }
            }
          },
          function error(err) {
            $scope.baseResetIdleWatch();

            console.log('Borrow error', err);

            for (i = 0; i < $scope.materials.length; i++) {
              if ($scope.materials[i].id === material.id) {
                $scope.materials[i].status = 'borrow.error';
                $scope.materials[i].information = 'borrow.was_not_successful';
                $scope.materials[i].loading = false;

                // @TODO: How can this be retried?

                break;
              }
            }
          }
        );
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
        // Iterate all tags in material and return tag if afi true.
        var found = material.tags.find(function (tag, index) {
          return tag.afi;
        });

        // If all AFIs have been turned off mark the material as borrowed.
        if (!found) {
          material.status = 'borrow.success';
          material.information = 'borrow.was_successful';
          material.loading = false;
          material.borrowed = true;

          // See if material was already added to borrowed materials.
          found = $scope.borrowedMaterials.find(function (item, index) {
            return item.id === material.id;
          });

          // Add to borrowed materials.
          if (!found) {
            $scope.borrowedMaterials.push(material);
          }
        }
      }
    };

    /**
     * Show the receipt modal.
     */
    $scope.showReceiptModal = function showReceiptModal() {
      receiptModal.$promise.then(receiptModal.show);
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
      receiptService.borrow(credentials.username, credentials.password, raw_materials, type).then(
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
      receiptModal.hide();
      processingModal.hide();
    });
  }
]);
