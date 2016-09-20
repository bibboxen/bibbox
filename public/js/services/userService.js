angular.module('BibBox').service('userService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

    // @TODO: Remove this, when the backend responds with a valid user.
    var loggedInUser = {
      "name": "Theis Test"
    };

    /**
     * Login.
     *
     * @param username
     * @param password
     * @returns {*|promise}
     */
    this.login = function login(username, password) {
      var deferred = $q.defer();

      if (!loggedInUser) {
        proxyService.emitEvent('login', 'login.success', 'login.error', {
          "username": username,
          "password": password
        }).then(
          function success(user) {
            loggedInUser = user;
            deferred.resolve(loggedInUser);
          },
          function error(err) {
            deferred.reject(err);
          }
        );
      }
      else {
        deferred.resolve(loggedInUser);
      }

      return deferred.promise;
    };

    /**
     * Logout.
     *
     * @TODO: Is this be the expected logout routine?
     */
    this.logout = function logout() {
      var deferred = $q.defer();

      if (loggedInUser) {
        // Log out in front end no matter what.
        loggedInUser = null;

        // Send logout event to backend.
        proxyService.emitEvent('logout', 'logout.success', 'logout.error', {}).then(
          function success(data) {
            deferred.resolve(data);
          },
          function error(err) {
            deferred.reject(err);
          }
        );
      }

      return deferred.promise;
    };

    /**
     * Get user.
     * @returns {*}|null
     *   The user if logged in, or null if not.
     */
    this.getUser = function getUser() {
      return loggedInUser;
    };
  }
]);