/**
 * @file
 * Contains the userService, that handles login/out of patrons,
 * checkin/out of materials.
 * This is the service that temporarily keeps login for the currently logged in
 * user (Patron).
 */

angular.module('BibBox').service('userService', ['$q', '$timeout', '$location', 'proxyService',
  function ($q, $timeout, $location, proxyService) {
    'use strict';

    var username = null;
    var password = null;
    var loggedIn = false;
    var offline = null;

    /**
     * Is user logged in?
     *
     * @returns {*}
     */
    this.userLoggedIn = function userLoggedIn() {
      return loggedIn;
    };

    /**
     * Get the current logged in users credentials.
     *
     * @returns {{username: *, password: *}}
     */
    this.getCredentials = function getCredentials() {
      return {
        'username': username,
        'password': password
      }
    };

    /**
     * Login.
     *
     * Tests if the user is valid.
     * @TODO: Does it check for valid user? Are there error codes that should
     * be handled?
     *
     * @param user
     * @param pass
     * @returns {*|promise}
     */
    this.login = function login(user, pass) {
      var deferred = $q.defer();

      var uniqueId = CryptoJS.MD5("userServiceLogin" + Date.now());

      proxyService.emitEvent('fbs.login', 'fbs.login.success' + uniqueId, 'fbs.login.err' + uniqueId, {
        "username": user,
        "password": pass,
        "busEvent": "fbs.login.success" + uniqueId,
        "errorEvent": "fbs.login.err" + uniqueId
      }).then(
        function success(loggedInSuccess) {
          username = user;
          password = pass;
          loggedIn = loggedInSuccess;
          offline = false;

          deferred.resolve(loggedInSuccess);
        },
        function error(err) {
          if (err.message === 'FBS is offline') {
            username = user;
            password = pass;
            loggedIn = true;
            offline = true;

            deferred.resolve(true);
          }
          else {
            username = null;
            password = null;
            loggedIn = false;
            offline = null;

            deferred.reject(err);
          }
        }
      );

      return deferred.promise;
    };

    /**
     * Logout.
     *
     * Deletes user data, thereby logging it out.
     */
    this.logout = function () {
      username = null;
      password = null;
      loggedIn = false;
      offline = null;
    };

    /**
     * Borrow a material.
     *
     * @param itemIdentifier
     */
    this.borrow = function borrow(itemIdentifier) {
      var deferred = $q.defer();

      proxyService.emitEvent('fbs.checkout', 'fbs.checkout.success' + itemIdentifier, 'fbs.error', {
        "busEvent": "fbs.checkout.success" + itemIdentifier,
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
     * Renew a material.
     *
     * @param itemIdentifier
     * @returns {Function}
     */
    this.renew = function renew(itemIdentifier) {
      var deferred = $q.defer();

      proxyService.emitEvent('fbs.renew', 'fbs.renew.success' + itemIdentifier, 'fbs.error', {
        "busEvent": "fbs.renew.success" + itemIdentifier,
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
     * Renew all materials for a user.
     *
     * @returns {Function}
     */
    this.renewAll = function renewAll() {
      var deferred = $q.defer();

      var uniqueId = CryptoJS.MD5("userServiceRenewAll" + Date.now());

      proxyService.emitEvent('fbs.renew.all', 'fbs.renew.all.success' + uniqueId, 'fbs.error', {
        "busEvent": "fbs.renew.all.success" + uniqueId,
        "username": username,
        "password": password
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
     * Get patron.
     *
     * Contains all info about the currently logged in patron.
     *
     * @returns {*|promise}
     */
    this.patron = function patron() {
      var deferred = $q.defer();

      var uniqueId = CryptoJS.MD5("userServicePatron" + Date.now());

      proxyService.emitEvent('fbs.patron', 'fbs.patron.success' + uniqueId, 'fbs.patron.error', {
        "busEvent": "fbs.patron.success" + uniqueId,
        "username": username,
        "password": password
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