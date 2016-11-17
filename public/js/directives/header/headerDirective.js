/**
 * @file
 * Contains the headerDirective.
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  angular.module('BibBox').directive('header', [
    function () {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/header.html',
        scope: {
          headline: '@',
          countdown: '='
        },
        link: function (scope) {
        }
      };
    }
  ]);
}).call(this);
