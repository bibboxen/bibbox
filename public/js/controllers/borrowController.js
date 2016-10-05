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
        },
        function (err) {
          // @TODO: Handle error.
          console.log(err);
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
     * On destroy.
     *
     * Log out of user service.
     * Stop listening for barcode.
     */
    $scope.$on("$destroy", function() {
      userService.logout();
      // @TODO: Unsubscribe to rfid.tag_detected
    });
  }
]);
