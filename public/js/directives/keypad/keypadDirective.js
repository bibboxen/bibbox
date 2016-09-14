/**
 * @file
 * Contains the keypadDirective.
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  angular.module('BibBox').directive('keypad', [
    function () {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/keypad.html',
        scope: {
          field: '=',
          enter: '&'
        },
        link: function (scope) {
          scope.pressKey = function pressKey(key) {
            if (key == 'back') {
              scope.field = scope.field.slice(0, -1);
            }
            else if (key == 'enter') {
              scope.enter();
            }
            else {
              scope.field = scope.field + key;
            }
          }
        }
      };
    }
  ]);
}).call(this);