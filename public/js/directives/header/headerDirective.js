/**
 * @file
 * Contains the headerDirective.
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  angular.module('BibBox').directive('header', ['config',
    function (config) {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/header.html',
        scope: {
          headline: '@',
          countdown: '='
        },
        link: function (scope) {
          scope.debug = config.debug;
        }
      };
    }
  ]);
}).call(this);
