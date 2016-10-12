/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', ['$scope', '$location', '$timeout', 'proxyService', 'Idle', 'receiptService',
  function($scope, $location, $timeout, proxyService, Idle, receiptService) {
    'use strict';

    var barcodeRunning = false;
    var registeredEvents = [];

    $scope.materials = [];

    // Restart idle service if not running.
    Idle.watch();

    /**
     * Listen for idle warning.
     */
    $scope.$on('IdleWarn', function (e, countdown) {
      $scope.$apply(function () {
        $scope.countdown = countdown;
      });
    });

    /**
     * Listen for idle timeout.
     */
    $scope.$on('IdleTimeout', function () {
      $scope.$evalAsync(function () {
        $location.path('/');
      });
    });

    /**
     * Listen for idle end.
     */
    $scope.$on('IdleEnd', function () {
      $scope.$apply(function () {
        $scope.countdown = null;
      });
    });

    /**
     * Processes a scanned item.
     *
     * @param id
     *   The id of the material.
     */
    var itemScannedResult = function itemScannedResult(id) {
      // Check if item has already been added.
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

        var resultEvent = 'fbs.checkin.success' + uniqueId;

        registeredEvents.push(resultEvent);
        registeredEvents.push('fbs.error');

        proxyService.emitEvent('fbs.checkin', resultEvent, 'fbs.error', {
          "busEvent": resultEvent,
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

      registeredEvents.push('barcode.data', 'barcode.err');

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
      console.log("returnController - receipt sending", $scope.materials);

      receiptService.returnReceipt($scope.materials.length, $scope.materials, 'printer').then(
        function(status) {
          console.log('returnController - receipt', status);
          $location.path('/');
        },
        function(err) {
          // @TODO: handel error etc.
          console.log('returnController - receipt', err);
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
      // Remove registered event listeners.
      for (var i = 0; i < registeredEvents.length; i++) {
        proxyService.removeAllEventlisteners(registeredEvents[i]);
      }

      stopBarcode();
    });
  }
]);
