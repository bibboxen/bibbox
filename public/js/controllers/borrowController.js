/**
 * @file
 * Borrow page controller.
 */

angular.module('BibBox').controller('BorrowController', ['$scope', '$controller', '$location', '$timeout', 'userService', 'receiptService', '$modal',
  function ($scope, $controller, $location, $timeout, userService, receiptService, $modal) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('RFIDBaseController', { $scope: $scope });

    // @TODO: Move to base controller.
    if (!userService.userLoggedIn()) {
      $scope.baseLogoutRedirect('/');
      return;
    }

    $scope.loading = true;

    // Sets $scope.currentPatron to the current logged in patron.
    $scope.baseGetPatron();

    /**
     * Contains the array of materials scanned.
     *
     * @type {Array}
     */
    $scope.materials = [];

    /**
     * Handle tag detected.
     *
     * @param tag
     *   The tag of material to check-out (borrow).
     */
    $scope.tagDetected = function tagDetected(tag) {
      var i;
      var material = $scope.addTag(tag, $scope.materials);

      // Check if all tags in series have been added.
      if (material.seriesLength === material.tags.length && !material.borrowed) {
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
                  break;
                }
              }
            }
          },
          function error(err) {
            $scope.baseResetIdleWatch();

            for (i = 0; i < $scope.materials.length; i++) {
              if ($scope.materials[i].id === material.id) {
                $scope.materials[i].status = 'borrow.error';
                $scope.materials[i].information = 'borrow.was_not_successful';
                $scope.materials[i].loading = false;
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
      var material = null;
      var id = tag.MID.slice(6);
      var i;

      // Check if item has already been added to the list.
      for (i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].id === id) {
          material = $scope.materials[i];
          break;
        }
      }

      // If item have not been added it to the scope (UI list).
      if (!material) {
        return;
      }

      // Remove tag from material.
      for (i = 0; i < material.tags.length; i++) {
        if (material.tags[i].UID === tag.UID) {
          //material.tags.slice(i, 1);

          // @TODO: What should happen?

          break;
        }
      }
    };

    /**
     * Tag AFI has been set.
     *
     * @param tag
     */
    $scope.tagAFISet = function itemAFISet(tag) {
      var material = null;
      var i, j;

      // Locate tag.
      for (i = 0; i < $scope.materials.length; i++) {
        // Set AFI of tag.
        for (j = 0; j < $scope.materials[i].tags.length; j++) {
          if ($scope.materials[i].tags[j].UID === tag.UID) {
            $scope.materials[i].tags[j].AFI = tag.AFI;

            // Set material for later evaluation.
            material = $scope.materials[i].tags[j];
            break;
          }
        }
        if (material) {
          break;
        }
      }

      // If the tag belonged to a material in $scope.materials.
      if (material) {
        var allAFISetToFalse = true;

        for (i = 0; i < material.tags.length; i++) {
          if (material.tags[i].AFI) {
            allAFISetToFalse = false;
            break;
          }
        }

        // If all AFIs have been turned off mark the material as borrowed.
        if (allAFISetToFalse) {
          material.status = 'borrow.success';
          material.information = 'borrow.was_successful';
          material.loading = false;
        }
      }
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

      receiptService.borrow(credentials.username, credentials.password, $scope.materials, type).then(
        function (status) {
          $scope.baseLogoutRedirect();
        },
        function (err) {
          alert(err.message);
        }
      );
    };

    /**
     * On destroy.
     *
     * Log out of user service.
     * Stop listening for barcode.
     */
    $scope.$on('$destroy', function () {
      userService.logout();
      receiptModal.hide();
    });
  }
]);
