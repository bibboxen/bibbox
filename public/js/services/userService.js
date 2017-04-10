/**
 * @file
 * Contains the userService.
 *
 * This service handles login/out of patrons and check-in/-out of materials.
 *
 * It temporarily stores login for the currently logged in user (Patron).
 */


angular.module('BibBox').factory('userService', ['$q', '$timeout', '$location', 'config', 'basicService', 'proxyService', 'userTrackerService', 'loggerService',
  function ($q, $timeout, $location, config, basicService, proxyService, userTrackerService, loggerService) {
    'use strict';

    // Extend this service with the basicService. It's copy to ensure that it is
    // not overridden, if not copy the extend will return an reference.
    var service = angular.extend(angular.copy(basicService), {});

    service.username = null;
    service.password = null;
    service.loggedIn = false;

    /**
     * Is user logged in?
     *
     * @returns {*}
     */
    service.userLoggedIn = function userLoggedIn() {
      return service.loggedIn;
    };

    /**
     * Get the current logged in users credentials.
     *
     * @returns {{username: *, password: *}}
     */
    service.getCredentials = function getCredentials() {
      return {
        username: service.username,
        password: service.password
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
    service.login = function login(username, password) {
      var deferred = $q.defer();
      var self = service;

      var uniqueId = CryptoJS.MD5('userServiceLogin' + Date.now());

      // Handel response when login request is completed.
      proxyService.once('fbs.login.success' + uniqueId, function (data) {
        if (!service.isEventExpired(data.timestamp, 'fbs.login.success', data)) {
          self.username = username;
          self.password = password;
          self.loggedIn = true;

          // User logged in, so clear tracker service.
          userTrackerService.clear(username);

          deferred.resolve();
        }
        else {
          deferred.reject(new Error('Event fbs.login.success timed out'));
        }
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
          // User not logged in add/or tracker user login attempt.
          userTrackerService.add(username);

          // Check if user has tried to many times. If so block the user.
          if (userTrackerService.check(username)) {
            self.block(username, 'To many login attempts: ' + config.loginAttempts.max).then(function () {
              // User blocked, so clear tracking.
              userTrackerService.clear(username);

              deferred.reject(err);
            },
            function () {
              loggerService.error(err);
            });
          }
          else {
            self.username = null;
            self.password = null;
            self.loggedIn = false;

            deferred.reject(err);
          }
        }
      });

      // Send the login request.
      proxyService.emit('fbs.login', {
        timestamp: new Date().getTime(),
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
    service.logout = function () {
      service.username = null;
      service.password = null;
      service.loggedIn = false;
    };

    /**
     * Borrow a material.
     *
     * @param itemIdentifier
     */
    service.borrow = function borrow(itemIdentifier) {
      var deferred = $q.defer();

      proxyService.once('fbs.checkout.success' + itemIdentifier, function (data) {
        if (!service.isEventExpired(data.timestamp, 'fbs.checkout.success', data)) {
          deferred.resolve(data.result);
        }
        else {
          deferred.reject(new Error('Event fbs.checkout.success timed out'));
        }
      });

      proxyService.once('fbs.checkout.error' + itemIdentifier, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.checkout', {
        timestamp: new Date().getTime(),
        busEvent: 'fbs.checkout.success' + itemIdentifier,
        errorEvent: 'fbs.checkout.error' + itemIdentifier,
        username: service.username,
        password: service.password,
        itemIdentifier: itemIdentifier
      });

      return deferred.promise;
    };

    /**
     * Check in material (return).
     *
     * @param itemIdentifier
     *   The id of the item to check in.
     * @param transaction
     *   The current date that the check ins should be grouped under if in
     *   offline mode.
     */
    service.checkIn = function checkIn(itemIdentifier, transaction) {
      var deferred = $q.defer();

      proxyService.once('fbs.checkin.success' + itemIdentifier, function (data) {
        if (!service.isEventExpired(data.timestamp, 'fbs.checkin.success', data)) {
          deferred.resolve(data.result);
        }
        else {
          deferred.reject(new Error('Event fbs.checkin.success timed out'));
        }
      });

      proxyService.once('fbs.checkin.error' + itemIdentifier, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.checkin', {
        timestamp: new Date().getTime(),
        busEvent: 'fbs.checkin.success' + itemIdentifier,
        errorEvent: 'fbs.checkin.error' + itemIdentifier,
        transaction: transaction,
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
    service.renew = function renew(itemIdentifier) {
      var deferred = $q.defer();

      proxyService.once('fbs.renew.success' + itemIdentifier, function (data) {
        if (!service.isEventExpired(data.timestamp, 'fbs.renew.success', data)) {
          deferred.resolve(data.result);
        }
        else {
          deferred.reject(new Error('Event fbs.renew.success timed out'));
        }
      });

      proxyService.once('fbs.renew.error' + itemIdentifier, function (err) {
        deferred.resolve(err);
      });

      proxyService.emit('fbs.renew', {
        timestamp: new Date().getTime(),
        busEvent: 'fbs.renew.success' + itemIdentifier,
        errorEvent: 'fbs.renew.error' + itemIdentifier,
        username: service.username,
        password: service.password,
        itemIdentifier: itemIdentifier
      });

      return deferred.promise;
    };

    /**
     * Renew all materials for a user.
     *
     * @returns {Function}
     */
    service.renewAll = function renewAll() {
      var deferred = $q.defer();
      var uniqueId = CryptoJS.MD5('userServiceRenewAll' + Date.now());

      proxyService.once('fbs.renew.all.success' + uniqueId, function (data) {
        if (!service.isEventExpired(data.timestamp, 'fbs.renew.all.success', data)) {
          deferred.resolve(data.result);
        }
        else {
          deferred.reject(new Error('Event fbs.renew.all.success timed out'));
        }
      });

      proxyService.once('fbs.renew.all.error' + uniqueId, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.renew.all', {
        timestamp: new Date().getTime(),
        busEvent: 'fbs.renew.all.success' + uniqueId,
        errorEvent: 'fbs.renew.all.error' + uniqueId,
        username: service.username,
        password: service.password
      });

      return deferred.promise;
    };

    /**
     * Block user.
     *
     * @returns {Function}
     */
    service.block = function block(username, reason) {
      var deferred = $q.defer();
      var uniqueId = CryptoJS.MD5('userServiceBlock' + Date.now());

      proxyService.once('fbs.block.success' + uniqueId, function (data) {
        if (!service.isEventExpired(data.timestamp, 'fbs.block.success', data)) {
          deferred.resolve(data.result);
        }
        else {
          deferred.reject(new Error('Event fbs.block.success timed out'));
        }
      });

      proxyService.once('fbs.block.error' + uniqueId, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.block', {
        timestamp: new Date().getTime(),
        busEvent: 'fbs.block.success' + uniqueId,
        errorEvent: 'fbs.block.error' + uniqueId,
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
    service.patron = function patron() {
      var deferred = $q.defer();
      var uniqueId = CryptoJS.MD5('userServicePatron' + Date.now());

      proxyService.once('fbs.patron.success' + uniqueId, function (data) {
        if (!service.isEventExpired(data.timestamp, 'fbs.patron.success', data)) {
          deferred.resolve(data.patron);
        }
        else {
          deferred.reject(new Error('Event fbs.patron.success timed out'));
        }
      });

      proxyService.once('fbs.patron.error' + uniqueId, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.patron', {
        timestamp: new Date().getTime(),
        busEvent: 'fbs.patron.success' + uniqueId,
        errorEvent: 'fbs.patron.error' + uniqueId,
        username: service.username,
        password: service.password
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
    service.isOnline = function isOnline() {
      var deferred = $q.defer();
      var uniqueId = CryptoJS.MD5('userServiceOnline' + Date.now());

      proxyService.once('fbs.online.response' + uniqueId, function (data) {
        if (!service.isEventExpired(data.timestamp, 'fbs.online.success', data)) {
          deferred.resolve(data.online);
        }
        else {
          deferred.reject(new Error('Event fbs.online.success timed out'));
        }
      });

      proxyService.once('fbs.online.error' + uniqueId, function (err) {
        deferred.reject(err);
      });

      proxyService.emit('fbs.online', {
        timestamp: new Date().getTime(),
        busEvent: 'fbs.online.response' + uniqueId,
        errorEvent: 'fbs.online.error' + uniqueId
      });

      return deferred.promise;
    };

    return service;
  }
]);
