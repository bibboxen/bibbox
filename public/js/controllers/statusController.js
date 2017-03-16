/**
 * @file
 * Status page controller.
 */

angular.module('BibBox').controller('StatusController', [
  '$scope', '$controller', '$location', '$translate', '$timeout', 'userService', 'receiptService', '$modal', 'config', 'loggerService',
  function ($scope, $controller, $location, $translate, $timeout, userService, receiptService, $modal, config, loggerService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

    $scope.loading = true;

    // @TODO: Move to base controller.
    if (!userService.userLoggedIn()) {
      $scope.baseLogoutRedirect('/');
      return;
    }

    // Should fines by displayed?
    $scope.displayFines = config.display_fines;

    $scope.materials = [];
    $scope.fineItems = [];
    $scope.currentPatron = null;

    // Pager config.
    $scope.pager = {
      itemsPerPage: 14,
      currentPage: 1
    };

    // Sets $scope.currentPatron to the current logged in patron.
    // Load materials for current user.
    $scope.baseGetPatron().then(function () {
      var i;
      var j;
      var item = null;

      // Add charged items.
      for (i = 0; i < $scope.currentPatron.chargedItems.length; i++) {
        item = angular.copy($scope.currentPatron.chargedItems[i]);
        $scope.materials.push(item);
      }

      // Add overdue items.
      for (i = 0; i < $scope.currentPatron.overdueItems.length; i++) {
        for (j = 0; j < $scope.materials.length; j++) {
          if ($scope.materials[j].id === $scope.currentPatron.overdueItems[i].id) {
            $scope.materials[j].overdue = true;
            $scope.materials[j].information = 'status.overdue';
          }
        }
      }

      // Add fines to items.
      for (i = 0; i < $scope.currentPatron.fineItems.length; i++) {
        for (j = 0; j < $scope.materials.length; j++) {
          if ($scope.materials[j].id === $scope.currentPatron.fineItems[i].id) {
            $scope.materials[j].fineItem = $scope.currentPatron.fineItems[i];
            break;
          }
        }
      }
    }, function (err) {
      loggerService.error(err);
    });

    /**
     * Renew a material.
     *
     * @param material
     */
    $scope.renew = function renew(material) {
      material.loading = true;

      userService.renew(material.id).then(
        function success(data) {
          material.loading = false;
          // Restart idle service if not running.
          $scope.baseResetIdleWatch();

          if (!data) {
            material.information = 'status.renew.failed';
            material.renewed = false;
            return;
          }

          if (data.renewalOk === 'Y') {
            material.newDate = data.dueDate;
            material.overdue = false;
            material.information = 'status.renew.ok';
          }
          else {
            material.information = data.screenMessage;
            material.renewed = false;
          }
        },
        function error(err) {
          material.loading = false;
          material.information = 'status.renew.failed';
          material.renewed = false;

          loggerService.error(err);

          // Restart idle service if not running.
          $scope.baseResetIdleWatch();
        }
      );
    };

    /**
     * Renew all materials.
     */
    $scope.renewAll = function renewAll() {
      var i;

      for (i = 0; i < $scope.materials.length; i++) {
        $scope.materials[i].loading = true;
      }

      userService.renewAll().then(
        function success(data) {
          // Restart idle service if not running.
          $scope.baseResetIdleWatch();

          var material;
          if (data.ok === '1') {
            // Update renewed items.
            if (data.hasOwnProperty('renewedItems')) {
              for (i = 0; i < data.renewedItems; i++) {
                for (material in $scope.materials) {
                  material = $scope.materials[material];

                  if (material.id === data.renewedItems[i].id) {
                    material.loading = false;
                    material.information = 'status.renew.ok';
                    material.overdue = false;
                    material.renewed = true;
                    break;
                  }
                }
              }
            }

            // Update un-renewed items.
            if (data.hasOwnProperty('unrenewedItems')) {
              for (i = 0; i < data.unrenewedItems.length; i++) {
                for (material in $scope.materials) {
                  material = $scope.materials[material];

                  if (material.id === data.unrenewedItems[i].id) {
                    material.loading = false;
                    material.information = data.unrenewedItems[i].reason;
                    material.renewed = false;
                    break;
                  }
                }
              }
            }
          }
          else {
            for (material in $scope.materials) {
              material = $scope.materials[material];
              material.loading = false;
              material.information = 'status.renew.failed';
              material.renewed = false;
            }
          }
        },
        function error(err) {
          loggerService.error(err);

          // Restart idle service if not running.
          $scope.baseResetIdleWatch();
        }
      );
    };

    /**
     * Setup fines modal.
     */
    var finesModal = $modal({
      scope: $scope,
      templateUrl: './views/modal_fines.html',
      show: false
    });
    $scope.showFinesModal = function showFinesModal() {
      finesModal.$promise.then(finesModal.show);
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
      var creds = userService.getCredentials();

      // @TODO: handel error etc.
      receiptService.status(creds.username, creds.password, type).then(
        function (status) {
          // Ignore.
        },
        function (err) {
          loggerService.error(err);
        }
      );

      // Always return to frontpage.
      $scope.baseLogoutRedirect();
    };

    /**
     * On destroy.
     *
     * Log out of user service.
     */
    $scope.$on('$destroy', function () {
      userService.logout();
      receiptModal.$promise.then(receiptModal.hide);
      finesModal.$promise.then(finesModal.hide);
    });
  }
]);
