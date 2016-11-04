/**
 * @file
 * Contains the userService.
 *
 * This service handles login/out of patrons and check-in/-out of materials.
 *
 * It temporarily stores login for the currently logged in user (Patron).
 */


angular.module('BibBox').service('userService', ['$q', '$timeout', '$location', 'proxyService', 'userTrackerService',
  function ($q, $timeout, $location, proxyService, userTrackerService) {
    'use strict';

    this.username = null;
    this.password = null;
    this.loggedIn = false;

    /**
     * Is user logged in?
     *
     * @returns {*}
     */
    this.userLoggedIn = function userLoggedIn() {
      return this.loggedIn;
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

      // Handel response when login request is completed.
      proxyService.once('fbs.login.success' + uniqueId, function(loggedIn) {
        self.username = username;
        self.password = password;
        self.loggedIn = loggedIn;

        if (loggedIn) {
          // User logged in, so clear tracker service.
          userTrackerService.clear(username);
        }
        else {
          // User not logged in add/or tracker user login attempt.
          userTrackerService.add(username);

          // Check if user has tried to many times. If so block the user.
          if (userTrackerService.check(username)) {
            userService.block(username, 'To many login attempts: ' + config.loginAttempts.max).then(function () {
              // @TODO: Inform the user to contact the desk.
            },
            function () {
              // @TODO: What to do...
              console.log(err);
            });
          }
        }

        deferred.resolve();
      });

      // Handel errors and the off-line case, which should allow the user to
      // continue.
      proxyService.once('fbs.login.err' + uniqueId, function (err) {
        if (err.message === 'FBS is offline') {
          self.username = username;
          self.password = password;
          self.loggedIn = true;

          deferred.resolve(true);
        }
        else {
          self.username = null;
          self.password = null;
          self.loggedIn = false;

          deferred.reject(err);
        }
      });

      // Send the login request.
      proxyService.emit('fbs.login', {
        username: username,
        password: password,
        busEvent: 'fbs.login.success' + uniqueId,
        errorEvent: 'fbs.login.err' + uniqueId
      });

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
      this.loggedIn = false;
    };

    /**
     * Borrow a material.
     *
     * @param itemIdentifier
     */
    this.borrow = function borrow(itemIdentifier) {
      var deferred = $q.defer();

      proxyService.once('fbs.checkout.success' + itemIdentifier, function (result) {
        deferred.resolve(result);
      });

      proxyService.once('fbs.checkout.error' + itemIdentifier, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.checkout', {
        busEvent: 'fbs.checkout.success' + itemIdentifier,
        errorEvent: 'fbs.checkout.error' + itemIdentifier,
        username: this.username,
        password: this.password,
        itemIdentifier: itemIdentifier
      });

      return deferred.promise;
    };

    /**
     * Check in material (return).
     *
     * @param itemIdentifier
     *   The id of the item to check in.
     * @param timestamp
     *   The current date that the check ins should be groupped under if in
     *   offline mode.
     */
    this.checkIn = function checkIn(itemIdentifier, timestamp) {
      var deferred = $q.defer();

      proxyService.once('fbs.checkin.success' + itemIdentifier, function (result) {
        deferred.resolve(result);
      });

      proxyService.once('fbs.checkin.error' + itemIdentifier, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.checkin', {
        busEvent: 'fbs.checkin.success' + itemIdentifier,
        errorEvent: 'fbs.checkin.error' + itemIdentifier,
        timestamp: timestamp,
        itemIdentifier: itemIdentifier
      });

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

      proxyService.once('fbs.renew.success' + itemIdentifier, function(result) {
        deferred.resolve(result);
      });

      proxyService.once('fbs.renew.error' + itemIdentifier, function(err) {
        deferred.resolve(err);
      });

      proxyService.emit('fbs.renew', {
        busEvent: 'fbs.renew.success' + itemIdentifier,
        errorEvent: 'fbs.renew.error' + itemIdentifier,
        username: this.username,
        password: this.password,
        itemIdentifier: itemIdentifier
      });

      return deferred.promise;
    };

    /**
     * Renew all materials for a user.
     *
     * @returns {Function}
     */
    this.renewAll = function renewAll() {
      var deferred = $q.defer();
      var uniqueId = CryptoJS.MD5('userServiceRenewAll' + Date.now());

      proxyService.once('fbs.renew.all.success' + uniqueId, function (result) {
        deferred.resolve(result);
      });

      proxyService.once('fbs.renew.all.error' + uniqueId, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.renew.all', {
        busEvent: 'fbs.renew.all.success' + uniqueId,
        errorEvent:  'fbs.renew.all.error' + uniqueId,
        username: this.username,
        password: this.password
      });

      return deferred.promise;
    };

    /**
     * Block user.
     *
     * @returns {Function}
     */
    this.block = function block(username, reason) {
      var deferred = $q.defer();
      var uniqueId = CryptoJS.MD5('userServiceBlock' + Date.now());

      proxyService.once('fbs.block.success' + uniqueId, function (result) {
        deferred.resolve(result);
      });

      proxyService.once('fbs.block.error' + uniqueId, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.block', {
        busEvent: 'fbs.block.success' + uniqueId,
        errorEvent:  'fbs.block.error' + uniqueId,
        username: username,
        password: reason
      });

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
      var uniqueId = CryptoJS.MD5('userServicePatron' + Date.now());

      proxyService.once('fbs.patron.success' + uniqueId, function (result) {
        deferred.resolve(result);
      });

      proxyService.once('fbs.patron.error' + uniqueId, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.patron', {
        busEvent: 'fbs.patron.success' + uniqueId,
        errorEvent: 'fbs.patron.error' + uniqueId,
        username: this.username,
        password: this.password
      });

      return deferred.promise;
    };

    /**
     * Check FBS is online.
     *
     * It's plased on user service as FBS has to due with users.
     *
     * @returns {Function}
     */
    this.isOnline = function isOnline() {
      var deferred = $q.defer();
      var uniqueId = CryptoJS.MD5('userServiceOnline' + Date.now());

      proxyService.once('fbs.online.response' + uniqueId, function (status) {
        deferred.resolve(status);
      });

      proxyService.once('fbs.online.error' + uniqueId, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.online', {
        busEvent: 'fbs.online.response' + uniqueId,
        errorEvent: 'fbs.online.error' + uniqueId
      });

      return deferred.promise;
    }
  }
]);
