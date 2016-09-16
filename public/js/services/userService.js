angular.module('BibBox').service('userService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

    var user;
    this.login = function login(username, password) {
      return true;
      /*
      proxyService.emitEvent('login', 'login.success', 'login.error', {

        "username": username,
        "password": password
      }).then(
        function success() {

        },
        function error() {

        }
      );       */
    };
  }
]);