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
    .when('/borrow', {
      controller: 'BorrowController',
      templateUrl: 'views/borrow.html'
    })

    .otherwise({
      controller: 'IndexController',
      templateUrl: 'views/index.html'
    });
});