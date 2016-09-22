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

    var itemScannedResult = function itemScannedResult(data) {
      userService.borrow(data).then(
        function (result) {
          console.log(result);

          var item = {};

          if (result.ok === "0") {
            item.status = 'borrow.error';
          }
          else {
            item.status = 'borrow.success';
          }

          $scope.materials.push(item);
        },
        function (err) {
          // @TODO: Handle error.
          console.log(err);
        }
      );

      console.log(data);
    };

    var itemScannedError = function itemScannedError(err) {
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
          itemScannedResult(data);
          stopBarcode();
        },
        function error(err) {
          itemScannedError(err);
        }
      );
    };

    /**
     * Stop scanning for a barcode.
     */
    var stopBarcode = function stopBarcode() {
      proxyService.emitEvent('barcode.stop', null, null, {}).then();
    };

    //startBarcode();

    // Test
    //itemScannedResult(4140809956);
    itemScannedResult(5010941603);
  }
]);
