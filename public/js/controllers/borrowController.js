/**
 * Borrow page controller.
 */
angular.module('BibBox').controller('BorrowController', ['$scope', '$location', 'userService', 'proxyService',
  function($scope, $location, userService, proxyService) {
    "use strict";

    $scope.loggedIn = false;

    if (!userService.userLoggedIn()) {
      $location.path('/');
      return;
    }

    $scope.loggedIn = true;

    $scope.materials = [];

    var barcodeResult = function barcodeResult(data) {
      userService.borrow(data).then(
        function (result) {

        },
        function (err) {
          // @TODO: Handle error.
          console.log(err);
        }
      );

      console.log(data);
    };

    var barcodeError = function barcodeError(err) {
      // @TODO: Handle error.
      console.log(err);
    };

    /**
     * Start scanning for a barcode.
     * Stops after one "barcode.data" has been returned.
     */
    var startBarcode = function scanBarcode() {
      proxyService.emitEvent('barcode.start', 'barcode.data', 'barcode.err', {}).then(
        function success(data) {
          barcodeResult(data);
          stopBarcode();
        },
        function error(err) {
          barcodeError(err);
        }
      );
    };

    /**
     * Stop scanning for a barcode.
     */
    var stopBarcode = function stopBarcode() {
      proxyService.emitEvent('barcode.stop', null, null, {}).then();
    };

    startBarcode();
  }
]);
