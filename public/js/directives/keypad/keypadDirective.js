/**
 * @file
 * Contains the keypadDirective.
 *
 * @TODO: Could use more documentation about how to use it?
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  angular.module('BibBox').directive('keypad', ['$document',
    function ($document) {
      return {
        restrict: 'E',
        replace: false,
        templateUrl: 'views/keypad.html',
        scope: {
          field: '=',
          enter: '&'
        },
        link: function (scope) {
          // Handler for button clicks.
          scope.pressKey = function pressKey(key) {
            if (key === 'back') {
              scope.field = scope.field.slice(0, -1);
            }
            else if (key === 'enter') {
              scope.enter();
            }
            else {
              scope.field = scope.field + key;
            }
          };

          // Handler for keyboard presses.
          var keypressHandler = function keypressHandler(event) {
            scope.$apply(function () {
              if (event.key === 'Backspace') {
                scope.field = scope.field.slice(0, -1);
              }
              else if (event.key === 'Enter') {
                scope.enter();
              }
              else if (event.key >= 0 && event.key <= 9) {
                scope.field = scope.field + event.key;
              }
              // Ignore all other keys.
            });
          };

          // Bind to keypress.
          $document.bind('keydown', keypressHandler);

          // Unbind keypress on destroy.
          scope.$on('$destroy', function () {
            $document.unbind('keydown', keypressHandler);
          });
        }
      };
    }
  ]);
}).call(this);
