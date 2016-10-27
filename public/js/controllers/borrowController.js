/**
 * @file
 * Borrow page controller.
 */

angular.module('BibBox').controller('BorrowController', ['$scope', '$controller', '$location', '$timeout', 'userService', 'receiptService', '$modal', 'rfidService',
  function ($scope, $controller, $location, $timeout, userService, receiptService, $modal, rfidService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

    // @TODO: Move to base controller.
    if (!userService.userLoggedIn()) {
      $scope.baseLogoutRedirect('/');
      return;
    }

    $scope.loading = true;

    // Sets $scope.currentPatron to the current logged in patron.
    $scope.baseGetPatron();

    /**
     * @TODO: documentation?
     *
     * @type {Array}
     */
    $scope.materials = [];

    /**
     * Check-out scanned result.
     *
     * @param tag
     *   The tag of material to check-out (borrow).
     */
    var itemScannedResult = function itemScannedResult(tag) {
      var material = null;
      var id = tag.MID.slice(6);

      // @TODO: Handle multiple tags in series.
      var seriesLength = parseInt(tag.MID.slice(2, 4));
      var numberInSeries = parseInt(tag.MID.slice(4, 6));

      tag.numberInSeries = numberInSeries;
      tag.seriesLength = seriesLength;

      // Check if item has already been added to the list.
      var itemNotAdded = true;
      for (var i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].id === id) {
          itemNotAdded = false;
          material = $scope.materials[i];
          break;
        }
      }

      // If item have not been added it to the scope (UI list).
      if (itemNotAdded) {
        // Add a first version of the material.
        material = {
          id: id,
          seriesLength: seriesLength,
          tags: [],
          title: id,
          loading: true
        };
        $scope.materials.push(material);
      }

      // Add tag to material if not already added.
      var alreadyAdded = false;
      for (var i = 0; i < material.tags.length; i++) {
        if (material.tags[i].UID === tag.UID) {
          alreadyAdded = true;
          break;
        }
      }
      if (!alreadyAdded) {
        material.tags.push(tag);
      }

      console.log(material);

      // Check if all tags in series have been added.
      if (material.seriesLength === material.tags.length && !material.borrowed) {
        // Attempt to borrow material.
        userService.borrow(id).then(
          function success(result) {
            $scope.baseResetIdleWatch();

            var i;
            if (result) {
              if (result.ok === '1') {
                for (i = 0; i < $scope.materials.length; i++) {
                  if ($scope.materials[i].id === result.itemIdentifier) {
                    $scope.materials[i] = {
                      id: result.itemIdentifier,
                      title: result.itemProperties.title,
                      author: result.itemProperties.author,
                      status: 'borrow.success',
                      information: 'borrow.was_successful',
                      dueDate: result.dueDate,
                      borrowed: true,
                      loading: false
                    };
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
                if ($scope.materials[i].id === id) {
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

            for (var i = 0; i < $scope.materials.length; i++) {
              if ($scope.materials[i].id === id) {
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
     * Setup receipt modal.
     */
    var receiptModal = $modal({
      scope: $scope,
      templateUrl: './views/modal_receipt.html',
      show: false
    });
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
          // @TODO: handel error etc.
          alert(err);
        }
      );
    };

    /**
     * Handler for when tag is detected.
     *
     * @param event
     * @param tag
     */
    function tagDetected(event, tag) {
      $scope.baseResetIdleWatch();

      itemScannedResult(tag);
    }

    /**
     * Handler for when tag is removed.
     *
     * @param event
     * @param tag
     */
    function tagRemoved(event, tag) {
      // @TODO: Handle.
    }

    $scope.$on('rfid.tag.detected', tagDetected);
    $scope.$on('rfid.tag.removed', tagRemoved);

    // Start listening for rfid events.
    rfidService.start($scope);

    //$timeout(function () {itemScannedResult('1101010000003225');}, 1000);
    //$timeout(function () {itemScannedResult('1101010000007889');}, 2000);
    //$timeout(function () {itemScannedResult('1101010000003572');}, 3000);

    /**
     * On destroy.
     *
     * Log out of user service.
     * Stop listening for barcode.
     */
    $scope.$on('$destroy', function () {
      userService.logout();
      receiptModal.hide();
      rfidService.stop();
    });
  }
]);
