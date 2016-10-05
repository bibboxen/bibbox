/**
 * Borrow page controller.
 */
angular.module('BibBox').controller('BorrowController', ['$scope', '$location', '$timeout', 'userService', 'proxyService',
  function($scope, $location, $timeout, userService, proxyService) {
    'use strict';

    if (!userService.userLoggedIn()) {
      $location.path('/');
      return;
    }

    var barcodeRunning = false;

    $scope.materials = [];

    var itemScannedResult = function itemScannedResult(data) {
      userService.borrow(data).then(
        function (result) {
          var item = {};

          item.title = result.itemProperties.title;
          item.author = result.itemProperties.author;

          if (result.ok === "0") {
            item.status = 'borrow.error';
            item.information = result.screenMessage;
          }
          else {
            item.dueDate = result.dueDate;
            item.status = 'borrow.success';
          }

          $scope.materials.push(item);

          startBarcode();
        },
        function (err) {
          alert(err);

          // @TODO: Handle error.
          console.log(err);

          startBarcode();
        }
      );
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
     * Log out of user service.
     * Stop listening for barcode.
     */
    $scope.$on("$destroy", function() {
      userService.logout();
      stopBarcode();
    });
  }
]);
