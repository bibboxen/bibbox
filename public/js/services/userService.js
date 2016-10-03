/**
 * @file
 * Contains the userService, that handles login/out of patrons,
 * checkin/out of materials.
 * This is the service that temporarily keeps login for the currently logged in
 * user (Patron).
 */

angular.module('BibBox').service('userService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

    var username = null;
    var password = null;
    var loggedIn = false;

    /**
     * Is user logged in?
     *
     * @returns {*}
     */
    this.userLoggedIn = function userLoggedIn() {
      return loggedIn;
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

      username = user;
      password = pass;

      proxyService.emitEvent('fbs.login', 'fbs.login.success', 'fbs.login.error', {
        "username": username,
        "password": password,
        "busEvent": "fbs.login.success"
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
     * Logout.
     *
     * Deletes user data, thereby logging it out.
     */
    this.logout = function () {
      username = null;
      password = null;
      loggedIn = false;
    };

    /**
     * Borrow a material.
     *
     * @param itemIdentifier
     */
    this.borrow = function borrow(itemIdentifier) {
      var deferred = $q.defer();

      proxyService.emitEvent('fbs.checkout', 'fbs.checkout.success', 'fbs.error', {
        "busEvent": "fbs.checkout.success",
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
     * Get patron.
     *
     * Contains all info about the currently logged in patron.
     *
     * @returns {*|promise}
     */
    this.patron = function patron() {
      var deferred = $q.defer();

      proxyService.emitEvent('fbs.patron', 'fbs.patron.success', 'fbs.patron.error', {
        "username": username,
        "password": password,
        "busEvent": "fbs.patron.success"
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