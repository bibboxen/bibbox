/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', ['$scope', '$location', '$timeout', 'proxyService', 'Idle', 'receiptService',
  function($scope, $location, $timeout, proxyService, Idle, receiptService) {
    'use strict';

    var barcodeRunning = false;

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

        var uniqueId = CryptoJS.MD5("returnControllerReturn" + Date.now());

        proxyService.emitEvent('fbs.checkin', 'fbs.checkin.success' + uniqueId, 'fbs.error', {
          "busEvent": "fbs.checkin.success" + uniqueId,
          "itemIdentifier": id
        }).then(
          function success(result) {
            console.log(result);

            if (result.ok === '1') {
              for (var i = 0; i < $scope.materials.length; i++) {
                if ($scope.materials[i].id === result.itemIdentifier) {
                  $scope.materials[i] = {
                    "id": result.itemIdentifier,
                    "title": result.itemProperties.title,
                    "author": result.itemProperties.author,
                    "status": 'return.success',
                    "information": "return.was_successful",
                    "loading": false
                  };
                  break;
                }
              }
            }
            else {
              for (var i = 0; i < $scope.materials.length; i++) {
                if ($scope.materials[i].id === result.itemIdentifier) {
                  $scope.materials[i].loading = false;
                  $scope.materials[i].information = result.screenMessage;
                  $scope.materials[i].status = 'return.error';

                  break;
                }
              }
            }
          },
          function error(err) {
            console.log(err);
          }
        );
      }
    };

    // @TODO: Subscribe to rfid.tag_detected

    /**
     * Go to front page.
     */
    $scope.gotoFront = function gotoFront() {
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

          // Start barcode again after 1 second.
          $timeout(startBarcode, 500);
        },
        function error(err) {
          // @TODO: Handle error.
          console.log(err);

          // Start barcode again.
          $timeout(startBarcode, 500);
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
     */
    $scope.receipt = function receipt() {
      receiptService.returnReceipt($scope.materials, 'printer').then(
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
     * Stop listening for barcode.
     */
    $scope.$on("$destroy", function() {
      stopBarcode();
    });
  }
]);
