angular.module('BibBox').service('userService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

    var username;
    var password;
    var loggedIn;

    /**
     * Login.
     *
     * @param user
     * @param pass
     * @returns {*|promise}
     */
    this.login = function login(user, pass) {
      var deferred = $q.defer();

      username = user;
      password = pass;

      var uniqueId = CryptoJS.MD5("userServiceLogin" + Date.now());

      proxyService.emitEvent('fbs.login', 'fbs.login.success' + uniqueId, 'fbs.login.error', {
        "username": username,
        "password": password,
        "busEvent": "fbs.login.success" + uniqueId
      }).then(
        function success(loggedInSuccess) {
          loggedIn = loggedInSuccess;
          deferred.resolve(loggedInSuccess);
        },
        function error(err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    };

    /**
     * Borrow a material.
     *
     * @param itemIdentifier
     */
    this.borrow = function borrow(itemIdentifier) {
      var deferred = $q.defer();

      var uniqueId = CryptoJS.MD5("userServiceBorrow" + Date.now());

      proxyService.emitEvent('fbs.checkout', 'fbs.checkout.success' + uniqueId, 'fbs.error', {
        "busEvent": "fbs.checkout.success" + uniqueId,
        "username": username,
        "password": password,
        "itemIdentifier": itemIdentifier
      }).then(
        function success(result) {
          deferred.resolve(result);
        },
        function error(err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    };

    /**
     * Is user logged in?
     *
     * @returns {*}
     */
    this.userLoggedIn = function userLoggedIn() {
      return loggedIn;
    };

    /**
     * Get patron.
     *
     * @returns {*|promise}
     */
    this.patron = function patron() {
      var deferred = $q.defer();

      var uniqueId = CryptoJS.MD5("userServicePatron" + Date.now());

      proxyService.emitEvent('fbs.patron', 'fbs.patron.success' + uniqueId, 'fbs.patron.error', {
        "username": username,
        "password": password,
        "busEvent": "fbs.patron.success" + uniqueId
      }).then(
        function success(patron) {
          deferred.resolve(patron);
        },
        function error(err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    }
  }
]);