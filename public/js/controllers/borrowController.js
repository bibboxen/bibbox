/**
 * Borrow page controller.
 */
angular.module('BibBox').controller('BorrowController', [
  '$scope', '$location', '$timeout', 'userService', 'proxyService', 'logoutService',
  function($scope, $location, $timeout, userService, proxyService, logoutService) {
    'use strict';

    if (!userService.userLoggedIn()) {
      $location.path('/');
      return;
    }

    $scope.startTimer = function () {
      $scope.compareTime = logoutService.startTimer();
    };

    var barcodeRunning = false;

    $scope.materials = [];

    var itemScannedResult = function itemScannedResult(id) {
      // Restart timer.
      $scope.startTimer();

      var itemNotAdded = true;
      for (var i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].id === id) {
          itemNotAdded = false;
          break;
        }
      }

      if (itemNotAdded) {
        $scope.materials.push({
          "id": id,
          "title": id,
          "loading": true
        });

        userService.borrow(id).then(
          function success(result) {
            if (result.ok === "0") {
              for (var i = 0; i < $scope.materials.length; i++) {
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
            else {
              for (var i = 0; i < $scope.materials.length; i++) {
                if ($scope.materials[i].id === result.itemIdentifier) {
                  $scope.materials[i] = {
                    "id": result.itemIdentifier,
                    "title": result.itemProperties.title,
                    "author": result.itemProperties.author,
                    "status": "borrow.success",
                    "information": "borrow.was_successful",
                    "dueDate": result.dueDate,
                    "loading": false
                  };
                  break;
                }
              }
            }

            //$scope.materials.push(item);

            startBarcode();
          },
          function error(err) {
            // @TODO: Handle error.
            console.log(err);

            startBarcode();
          }
        );
      }
    };

    // @TODO: Subscribe to rfid.tag_detected

    /**
     * Go to front page.
     */
    $scope.gotoFront = function gotoFront() {
      userService.logout();
      $location.path('/');
    };

    /**
    * Start scanning for a barcode.
    * Stops after one "barcode.data" has been returned.
    */
    var startBarcode = function scanBarcode() {
      barcodeRunning = true;

      proxyService.emitEvent('barcode.start', 'barcode.data', 'barcode.err', {}).then(
        function success(data) {
          itemScannedResult(data);

          // Start barcode again.
          startBarcode();
        },
        function error(err) {
          // @TODO: Handle error.
          console.log(err);

          // Start barcode again.
          startBarcode();
        }
      );
    };

    /**
     * Stop scanning for a barcode.
     */
    var stopBarcode = function stopBarcode() {
      if (barcodeRunning) {
        proxyService.emitEvent('barcode.stop', null, null, {}).then(
          function () {
            barcodeRunning = false;
          }
        );
      }
    };

    // Start looking for material.
    startBarcode();

    // Start timer
    $scope.startTimer();

    /**
     * On destroy.
     *
     * Log out of user service.
     * Stop listening for barcode.
     */
    $scope.$on("$destroy", function() {
      userService.logout();
      stopBarcode();

      logoutService.cancelTimer();
    });
  }
]);
