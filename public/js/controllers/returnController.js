/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', ['$scope', '$location', 'proxyService',
  function($scope, $location, proxyService) {
    'use strict';

    var barcodeRunning = false;

    $scope.materials = [];

    var itemScannedResult = function itemScannedResult(id) {
      var uniqueId = CryptoJS.MD5("returnControllerReturn" + Date.now());

      proxyService.emitEvent('fbs.checkin', 'fbs.checkin.success' + uniqueId, 'fbs.error', {
        "busEvent": "fbs.checkin.success" + uniqueId,
        "itemIdentifier": id
      }).then(
        function success(result) {
          console.log(result);
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
