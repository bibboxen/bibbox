/**
 * @file
 * Handles request for receipt(s) (printed) and notifications (mailed).
 */

angular.module('BibBox').service('receiptService', ['$q', 'tmhDynamicLocale', 'proxyService',
  function ($q, tmhDynamicLocale, proxyService) {
    'use strict';

    /**
     * Check if we are in offline mode.
     *
     * This is done by checking the first item for offline property.
     *
     * @param items
     *   The items that are about to be checked-out or checked-in.
     * @returns {*}
     *   True if offline else false.
     * @private
     */
    function _isOffline(items) {
      var item;
      if (Object.prototype.toString.call(items) === '[object Array]') {
        item = items[0];
      }
      else {
        for (var key in items) {
          if (items[key].length) {
            item = items[key][0];
          }
        }
      }

      // Check if this is off-line materials.
      if (item.hasOwnProperty('offline')) {
        return item.offline;
      }

      return false;
    }

    /**
     * Get mails address for a list of patrons.
     *
     * @param {array} patronIdentifiers
     *   The identifiers for the patrons.
     *
     * @returns {Function}
     */
    this.getPatronsInformation = function getPatronsInformation(patronIdentifiers) {
      var deferred = $q.defer();

      proxyService.once('notification.response', function (mailAddresses) {
        deferred.resolve(mailAddresses);
      });

      proxyService.once('notification.error', function (err) {
        deferred.reject(err);
      });

      proxyService.emit('notification.getPatronsInformation', {
        timestamp: new Date().getTime(),
        patronIdentifiers: patronIdentifiers,
        busEvent: 'notification.response',
        errorEvent: 'notification.error'
      });

      return deferred.promise;
    };

    /**
     * Status receipt.
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
        timestamp: new Date().getTime(),
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
        timestamp: new Date().getTime(),
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

      if (_isOffline(items)) {
        proxyService.emit('notification.checkOutOffline', {
          timestamp: new Date().getTime(),
          items: items,
          lang: tmhDynamicLocale.get(),
          busEvent: 'notification.response',
          errorEvent: 'notification.error'
        });
      }
      else {
        proxyService.emit('notification.checkOut', {
          timestamp: new Date().getTime(),
          username: username,
          password: password,
          items: items,
          mail: type === 'mail',
          lang: tmhDynamicLocale.get(),
          busEvent: 'notification.response',
          errorEvent: 'notification.error'
        });
      }

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

      if (_isOffline(items)) {
        proxyService.emit('notification.checkInOffline', {
          timestamp: new Date().getTime(),
          lang: tmhDynamicLocale.get(),
          items: items,
          busEvent: 'notification.response',
          errorEvent: 'notification.error'
        });
      }
      else {
        proxyService.emit('notification.checkIn', {
          timestamp: new Date().getTime(),
          mail: type === 'mail',
          lang: tmhDynamicLocale.get(),
          items: items,
          busEvent: 'notification.response',
          errorEvent: 'notification.error'
        });
      }

      return deferred.promise;
    };
  }
]);
