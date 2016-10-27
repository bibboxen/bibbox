/**
 * Return page controller.
 */
angular.module('BibBox').controller('ReturnController', ['$scope', '$controller', '$location', '$timeout', 'userService', 'receiptService', 'rfidService',
  function ($scope, $controller, $location, $timeout, userService, receiptService, rfidService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', {$scope: $scope});

    // Store raw check-in responses as it's need to print receipt.
    var raw_materials = [];

    $scope.materials = [];

    // User when offline to group returns into a single file.
    var currentDate = new Date().getTime();

    /**
     * Check-in scanned result.
     *
     * @param tag
     *   The tag of material to check-in (return).
     */
    var itemScannedResult = function itemScannedResult(tag) {
      var id = tag.MID.slice(6);

      // @TODO: Handle multiple tags in series.
      var serieLength = tag.MID.slice(2, 4);
      var numberInSerie = tag.MID.slice(4, 6);

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
          id: id,
          title: id,
          loading: true
        });

        userService.checkIn(id, currentDate).then(function (result) {
          var i;
          $scope.baseResetIdleWatch();

          // Store the raw result (it's used to send with receipts).
          raw_materials.push(result);

          if (result) {
            if (result.ok === '1') {
              for (i = 0; i < $scope.materials.length; i++) {
                if ($scope.materials[i].id === result.itemIdentifier) {
                  console.log(result);
                  $scope.materials[i] = {
                    id: result.itemIdentifier,
                    title: result.itemProperties.title,
                    author: result.itemProperties.author,
                    status: 'return.success',
                    information: 'return.was_successful',
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
                  $scope.materials[i].status = 'return.error';

                  break;
                }
              }
            }
          }
          else {
            // @TODO: Handle error.
            console.log('result === false');
          }
        }, function (err) {
          // @TODO: Handle error.
          console.log(err);
        });
      }
    };

    // @TODO: Subscribe to rfid.tag_detected

    /**
     * Print receipt.
     */
    $scope.receipt = function receipt() {
      receiptService.returnReceipt(raw_materials, 'printer').then(
        function (status) {
          $scope.baseLogoutRedirect();
        },
        function (err) {
          // @TODO: handel error etc.
          console.error('returnController - receipt', err);
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

    // @TODO: Remove.
    //$timeout(function () {itemScannedResult('1101013846646417');}, 1000);
    //$timeout(function () {itemScannedResult('1101013846469957');}, 2000);
    //$timeout(function () {itemScannedResult('1101015010941603');}, 3000);

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      $scope.removeListener('rfid.tag.detected', tagDetected);
      $scope.removeListener('rfid.tag.removed', tagRemoved);
      rfidService.stop();
    });
  }
]);
