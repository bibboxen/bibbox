/**
 * @file
 * Handles request for receipt(s) (printed) and notifications (mailed).
 */

angular.module('BibBox').service('receiptService', ['$q', 'tmhDynamicLocale', 'proxyService',
  function ($q, tmhDynamicLocale, proxyService) {
    'use strict';

    /**
     * States receipt.
     *
     * @param username
     *   Username to get receipt data for.
     * @param password
     *   Password for that user.
     * @param type
     *   The type of receipt.
     *
     * @returns {Function}
     */
    this.status = function status(username, password, type) {
      var deferred = $q.defer();

      proxyService.once('notification.response', function (status) {
        deferred.resolve(status);
      });

      proxyService.once('notification.error', function (err) {
        deferred.reject(err);
      });

      proxyService.emit('notification.status', {
        username: username,
        password: password,
        mail: type === 'mail',
        lang: tmhDynamicLocale.get(),
        busEvent: 'notification.response',
        errorEvent: 'notification.error'
      });

      return deferred.promise;
    };

    /**
     * Reservation receipt.
     *
     * @param username
     *   Username to get receipt data for.
     * @param password
     *   Password for that user.
     * @param type
     *   The type of receipt.
     *
     * @returns {Function}
     */
    this.reservations = function reservations(username, password, type) {
      var deferred = $q.defer();

      proxyService.once('notification.response', function (status) {
        deferred.resolve(status);
      });

      proxyService.once('notification.error', function (err) {
        deferred.reject(err);
      });

      proxyService.emit('notification.reservations', {
        username: username,
        password: password,
        mail: type === 'mail',
        lang: tmhDynamicLocale.get(),
        busEvent: 'notification.response',
        errorEvent: 'notification.error'
      });

      return deferred.promise;
    };

    /**
     * Borrow receipt.
     *
     * @param username
     *   Username to get receipt data for.
     * @param password
     *   Password for that user.
     * @param items
     *   The items to
     * @param type
     *   The type of receipt.
     *
     * @returns {Function}
     */
    this.borrow = function borrow(username, password, items, type) {
      var deferred = $q.defer();

      proxyService.once('notification.response', function (status) {
        deferred.resolve(status);
      });

      proxyService.once('notification.error', function (err) {
        deferred.reject(err);
      });

      proxyService.emit('notification.checkOut', 'notification.response', null, {
        username: username,
        password: password,
        mail: type === 'mail',
        lang: tmhDynamicLocale.get(),
        items: items,
        busEvent: 'notification.response',
        errorEvent: 'notification.error'
      });

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

      proxyService.once('notification.response', function (status) {
        deferred.resolve(status);
      });

      proxyService.once('notification.error', function (err) {
        deferred.reject(err);
      });

      proxyService.emit('notification.checkIn', {
        mail: type === 'mail',
        lang: tmhDynamicLocale.get(),
        items: items,
        busEvent: 'notification.response',
        errorEvent: 'notification.error'
      });

      return deferred.promise;
    };
  }
]);
