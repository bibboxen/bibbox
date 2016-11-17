/**
 * @file
 * Contains the routing for the ikApp module.
 */

/**
 * Routing.
 */
angular.module('BibBox').config(function ($routeProvider) {
  'use strict';

  $routeProvider
    .when('/login/:redirectUrl', {
      controller: 'LoginController',
      templateUrl: 'views/login.html'
    })
    .when('/borrow', {
      controller: 'BorrowController',
      templateUrl: 'views/borrow.html'
    })
    .when('/status', {
      controller: 'StatusController',
      templateUrl: 'views/status.html'
    })
    .when('/reservations', {
      controller: 'ReservationsController',
      templateUrl: 'views/reservations.html'
    })
    .when('/return', {
      controller: 'ReturnController',
      templateUrl: 'views/return.html'
    })
    .otherwise({
      controller: 'IndexController',
      templateUrl: 'views/index.html'
    });
});
