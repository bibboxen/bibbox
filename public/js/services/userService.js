/**
 * @file
 * Contains the userService.
 *
 * This service handles login/out of patrons and check-in/-out of materials.
 *
 * It temporarily stores login for the currently logged in user (Patron).
 */


angular.module('BibBox').service('userService', ['$q', '$timeout', '$location', 'proxyService',
  function ($q, $timeout, $location, proxyService) {
    'use strict';

    this.username = null;
    this.password = null;
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
     * Get the current logged in users credentials.
     *
     * @returns {{username: *, password: *}}
     */
    this.getCredentials = function getCredentials() {
      return {
        username: this.username,
        password: this.password
      };
    };

    /**
     * Login.
     *
     * @TODO: Does it check for valid user? Are there error codes that should
     *        be handled?
     *
     * @param username
     *   The username of the current user.
     * @param password
     *   The current users password.
     *
     * @returns {*|promise}
     *
     */
    this.login = function login(username, password) {
      var deferred = $q.defer();
      var self = this;

      var uniqueId = CryptoJS.MD5('userServiceLogin' + Date.now());

      proxyService.emitEvent('fbs.login', 'fbs.login.success' + uniqueId, 'fbs.login.err' + uniqueId, {
        username: username,
        password: password,
        busEvent: 'fbs.login.success' + uniqueId,
        errorEvent: 'fbs.login.err' + uniqueId
      }).then(
        function success(loggedInSuccess) {
          self.username = username;
          self.password = password;
          loggedIn = loggedInSuccess;

          deferred.resolve(loggedInSuccess);
        },
        function error(err) {
          if (err.message === 'FBS is offline') {
            console.log('User logged in, in offline mode.');
            self.username = username;
            self.password = password;
            loggedIn = true;

            deferred.resolve(true);
          }
          else {
            self.username = null;
            self.password = null;
            loggedIn = false;

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
      this.username = null;
      this.password = null;
      loggedIn = false;
    };

    /**
     * Borrow a material.
     *
     * @param itemIdentifier
     */
    this.borrow = function borrow(itemIdentifier) {
      var deferred = $q.defer();
      var self = this;

      proxyService.emitEvent('fbs.checkout', 'fbs.checkout.success' + itemIdentifier, 'fbs.checkout.error' + itemIdentifier, {
        busEvent: 'fbs.checkout.success' + itemIdentifier,
        errorEvent: 'fbs.checkout.error' + itemIdentifier,
        username: self.username,
        password: self.password,
        itemIdentifier: itemIdentifier
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
      var self = this;

      proxyService.emitEvent('fbs.renew', 'fbs.renew.success' + itemIdentifier, 'fbs.error', {
        busEvent: 'fbs.renew.success' + itemIdentifier,
        username: self.username,
        password: self.password,
        itemIdentifier: itemIdentifier
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
      var self = this;

      var uniqueId = CryptoJS.MD5('userServiceRenewAll' + Date.now());

      proxyService.emitEvent('fbs.renew.all', 'fbs.renew.all.success' + uniqueId, 'fbs.error', {
        busEvent: 'fbs.renew.all.success' + uniqueId,
        username: self.username,
        password: self.password
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
      var self = this;

      var uniqueId = CryptoJS.MD5('userServicePatron' + Date.now());

      proxyService.emitEvent('fbs.patron', 'fbs.patron.success' + uniqueId, 'fbs.patron.error', {
        busEvent: 'fbs.patron.success' + uniqueId,
        username: self.username,
        password: self.password
      }).then(
        function success(patron) {
          deferred.resolve(patron);
        },
        function error(err) {
          deferred.reject(err);
        }
      );

      return deferred.promise;
    };
  }
]);
