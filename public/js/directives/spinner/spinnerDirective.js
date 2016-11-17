/**
 * @file
 * Contains the spinnerDirective.
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  /**
   * @TODO: Missing documentation and why global?
   */
  angular.module('BibBox').directive('spinnerGlobal', [
    function () {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/spinner-global.html'
      };
    }
  ]);

  /**
   * @TODO: Missing documentation?
   */
  angular.module('BibBox').directive('spinner', [
    function () {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/spinner.html'
      };
    }
  ]);
}).call(this);
