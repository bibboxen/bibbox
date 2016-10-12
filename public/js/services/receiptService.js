/**
 * @file
 * Handles request for receipt(s) (printed) and notifications (mailed).
 */

angular.module('BibBox').service('receiptService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

    /**
     * States receipt.
     *
     * @param user
     *   Username to get receipt data for.
     * @param pass
     *   Password for that user.
     * @param type
     *   The type of receipt.
     *
     * @returns {Function}
     */
    this.status = function status(user, pass, type) {
      var deferred = $q.defer();

      proxyService.emitEvent('notification.status', 'notification.response', null, {
        'username': user,
        'password': pass,
        'mail': type === 'mail',
        'busEvent': 'notification.response'
      }).then(
        function success(status) {
          deferred.resolve(status);
        },
        function error(err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    };

    /**
     * Reservation receipt.
     *
     * @param user
     *   Username to get receipt data for.
     * @param pass
     *   Password for that user.
     * @param type
     *   The type of receipt.
     *
     * @returns {Function}
     */
    this.reservations = function reservations(user, pass, type) {
      var deferred = $q.defer();

      proxyService.emitEvent('notification.reservations', 'notification.response', null, {
        'username': user,
        'password': pass,
        'mail': type === 'mail',
        'busEvent': 'notification.response'
      }).then(
        function success(status) {
          deferred.resolve(status);
        },
        function error(err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    };

    /**
     * Borrow receipt.
     *
     * @param user
     *   Username to get receipt data for.
     * @param pass
     *   Password for that user.
     * @param items
     *   The items to
     * @param type
     *   The type of receipt.
     *
     * @returns {Function}
     */
    this.borrow = function borrow(user, pass, items, type) {
      var deferred = $q.defer();

      proxyService.emitEvent('notification.borrow', 'notification.response', null, {
        'username': user,
        'password': pass,
        'mail': type === 'mail',
        'items': items,
        'busEvent': 'notification.response'
      }).then(
        function success(status) {
          deferred.resolve(status);
        },
        function error(err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    };

    /**
     * Return receipt.
     *
     * @param items
     *   The items to
     * @param type
     *   The type of receipt.
     *
     * @returns {Function}
     */
    this.returnReceipt = function returnReceipt(items, type) {
      var deferred = $q.defer();

      proxyService.emitEvent('notification.return', 'notification.response', null, {
        'mail': type === 'mail',
        'counter': counter,
        'items': items,
        'busEvent': 'notification.response'
      }).then(
        function success(status) {
          deferred.resolve(status);
        },
        function error(err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    };
  }
]);