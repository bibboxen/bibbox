/**
 * @file
 * Borrow page controller.
 */

angular.module('BibBox').controller('BorrowController', ['$scope', '$controller', '$location', '$timeout', 'userService', 'Idle', 'receiptService', '$modal', 'rfidService',
  function ($scope, $controller, $location, $timeout, userService, Idle, receiptService, $modal, rfidService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

    // @TODO: Move to base controller.
    if (!userService.userLoggedIn()) {
      $scope.baseLogoutRedirect('/');
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
          $scope.loading = false;
          // @TODO: Report error.
          console.error('Patron not defined.');
        }
      },
      function (err) {
        $scope.loading = false;
        // @TODO: Report error.
        console.error(err);
      }
    );

    /**
     * @TODO: documentation?
     *
     * @type {Array}
     */
    $scope.materials = [];

    /**
     * @TODO: Missing documentation.
     *
     * @param id
     *  @TODO: Missing doc.
     */
    var itemScannedResult = function itemScannedResult(id) {
      // Check if item have been added before to the list.
      var itemNotAdded = true;
      for (var i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].id === id) {
          itemNotAdded = false;
          break;
        }
      }

      // If item have not been added it to the scope (UI list) and send requests
      // to the user service to borrow the item.
      if (itemNotAdded) {
        $scope.materials.push({
          id: id,
          title: id,
          loading: true
        });

        userService.borrow(id).then(
          function success(result) {
            // Restart the idle service, so the user is not logged out during
            // scanning events.
            Idle.watch();

            var i;
            if (result) {
              if (result.ok === '0') {
                for (i = 0; i < $scope.materials.length; i++) {
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
                for (i = 0; i < $scope.materials.length; i++) {
                  if ($scope.materials[i].id === result.itemIdentifier) {
                    $scope.materials[i] = {
                      id: result.itemIdentifier,
                      title: result.itemProperties.title,
                      author: result.itemProperties.author,
                      status: 'borrow.success',
                      information: 'borrow.was_successful',
                      dueDate: result.dueDate,
                      loading: false
                    };
                    break;
                  }
                }
              }
            }
            else {
              for (i = 0; i < $scope.materials.length; i++) {
                if ($scope.materials[i].id === id) {
                  $scope.materials[i].status = 'borrow.error';
                  $scope.materials[i].information = 'borrow.was_not_successful';
                  $scope.materials[i].loading = false;
                  break;
                }
              }
            }
          },
          function error(err) {
            // Restart the idle service, so the user is not logged out during
            // scanning events.
            Idle.watch();

            for (var i = 0; i < $scope.materials.length; i++) {
              if ($scope.materials[i].id === id) {
                $scope.materials[i].status = 'borrow.error';
                $scope.materials[i].information = 'borrow.was_not_successful';
                $scope.materials[i].loading = false;
                break;
              }
            }
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
     * Setup receipt modal.
     */
    var receiptModal = $modal({
      scope: $scope,
      templateUrl: './views/modal_receipt.html',
      show: false
    });
    $scope.showReceiptModal = function showReceiptModal() {
      receiptModal.$promise.then(receiptModal.show);
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
        function (status) {
          alert('mail sent');

          // @TODO: Redirect to front page.
        },
        function (err) {
          // @TODO: handel error etc.
          alert(err);
        }
      );
    };

    function tagDetected(tag) {
      itemScannedResult(tag.MID);
    }

    function tagRemoved(tag) {
      // @TODO: Handle.
    }

    $scope.$on('rfid.tag.detected', tagDetected);
    $scope.$on('rfid.tag.removed', tagRemoved);

    // Start listening for rfid events.
    rfidService.start($scope);


    //$timeout(function () {itemScannedResult('0000003225');}, 1000);
    //$timeout(function () {itemScannedResult('0000007889');}, 2000);
    //$timeout(function () {itemScannedResult('0000003572');}, 3000);

    /**
     * On destroy.
     *
     * Log out of user service.
     * Stop listening for barcode.
     */
    $scope.$on('$destroy', function () {
      userService.logout();
      receiptModal.hide();
    });
  }
]);
