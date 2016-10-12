/**
 * Borrow page controller.
 */
angular.module('BibBox').controller('BorrowController', ['$scope', '$location', '$timeout', 'userService', 'proxyService', 'Idle', 'receiptService',
  function ($scope, $location, $timeout, userService, proxyService, Idle, receiptService) {
    'use strict';

    if (!userService.userLoggedIn()) {
      $location.path('/');
      return;
    }

    $scope.loading = true;

    userService.patron().then(
      function (patron) {
        $scope.loading = false;

        console.log(patron);

        // If patron exists, get reservations.
        if (patron) {
          $scope.currentPatron = patron;
        }
        else {
          // @TODO: Report error.
          console.log(err);
        }
      },
      function (err) {
        $scope.loading = false;
        // @TODO: Report error.
        console.log(err);
      }
    );

    // Restart idle service if not running.
    Idle.watch();

    $scope.$on('IdleWarn', function (e, countdown) {
      $scope.$apply(function () {
        $scope.countdown = countdown;
      });
    });

    $scope.$on('IdleTimeout', function () {
      $scope.$evalAsync(function () {
        $location.path('/');
      });
    });

    $scope.$on('IdleEnd', function () {
      $scope.$apply(function () {
        $scope.countdown = null;
      });
    });

    var barcodeRunning = false;

    $scope.materials = [];

    var itemScannedResult = function itemScannedResult(id) {
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

      proxyService.emitEvent('barcode.start', 'barcode.data', 'barcode.err', {})
      .then(
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

    /**
     * Print receipt.
     *
     * @param type
     *   'mail' or 'printer'
     */
    $scope.receipt = function receipt(type) {
      var credentials = userService.getCredentials();

      receiptService.borrow(credentials.username, credentials.password, $scope.materials, type).then(
        function(status) {
          alert('mail sent');
        },
        function(err) {
          // @TODO: handel error etc.
          alert(err);
        }
      );
    };

    // Start looking for material.
    startBarcode();

    /**
     * On destroy.
     *
     * Log out of user service.
     * Stop listening for barcode.
     */
    $scope.$on("$destroy", function () {
      userService.logout();
      stopBarcode();
    });
  }
]);
