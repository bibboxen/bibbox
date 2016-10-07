/**
 * @file
 * Handles request for receipt(s) (printed) and notifications (mailed).
 */

angular.module('BibBox').service('receiptService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

    this.status = function status(user, pass, type) {
      var deferred = $q.defer();

      proxyService.emitEvent('notification.status', 'notification.status.sent', null, {
        'username': user,
        'password': pass,
        'mail': type === 'mail',
        'busEvent': 'notification.status.sent'
      }).then(
        function success(status) {
          deferred.resolve(status);
        },
        function error(err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    }
  }
]);