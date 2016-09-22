angular.module('BibBox').service('userService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

    var username;
    var password;

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

      proxyService.emitEvent('fbs.login', 'fbs.login.success', 'fbs.login.error', {
        "username": username,
        "password": password,
        "busEvent": "fbs.login.success"
      }).then(
        function success(loggedIn) {
          deferred.resolve(loggedIn);
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