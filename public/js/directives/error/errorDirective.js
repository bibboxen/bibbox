/**
 * @file
 * Error directive to display errors (out-of-order).
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  angular.module('BibBox').directive('error', [
    function () {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/error.html'
      };
    }
  ]);
}).call(this);
