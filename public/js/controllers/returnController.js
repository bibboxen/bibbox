/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', ['$scope', '$location', '$timeout', 'proxyService',
  function($scope, $location, $timeout, proxyService) {
    'use strict';

    var barcodeRunning = false;

    $scope.materials = [];

    var itemScannedResult = function itemScannedResult(id) {
      var itemNotAdded = true;
      for (var i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].id === result.itemIdentifier) {
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
      }

      var uniqueId = CryptoJS.MD5("returnControllerReturn" + Date.now());

      proxyService.emitEvent('fbs.checkin', 'fbs.checkin.success' + uniqueId, 'fbs.error', {
        "busEvent": "fbs.checkin.success" + uniqueId,
        "itemIdentifier": id
      }).then(
        function success(result) {
          if (result.ok === '1') {
            for (var i = 0; i < $scope.materials.length; i++) {
              if ($scope.materials[i].id === result.itemIdentifier) {
                $scope.materials[i] = {
                  "id": result.itemIdentifier,
                  "title": result.itemProperties.title,
                  "author": result.itemProperties.author,
                  "status": 'return.success',
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
                $scope.materials[i].information = "Failed (TODO)";
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
      proxyService.emitEvent('barcode.stop', null, null, {}).then(
        function () {
          barcodeRunning = false;
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
