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
  }
]);