/**
 * @file
 * Contains the spinnerDirective.
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  angular.module('BibBox').directive('spinnerGlobal', [
    function () {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/spinner-global.html'
      }
    }
  ]);

  angular.module('BibBox').directive('spinner', [
    function () {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/spinner.html'
      }
    }
  ]);
}).call(this);