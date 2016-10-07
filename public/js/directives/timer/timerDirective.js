/**
 * @file
 * Contains the timerDirective module.
 */

/**
 * Setup the module.
 */
(function () {
  'use strict';

  /**
   * date component directive.
   *
   * html parameters:
   */
  angular.module('BibBox').directive('timer', ['$interval',
    function ($interval) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'views/timer.html',
        scope: {
          "compareTime": "=",
          "onClick": "&"
        },
        link: function (scope) {
          scope.timer = null;

          var update = function update() {
            if (scope.compareTime) {
              var now = new Date();
              scope.timer = Math.max(0, parseInt((scope.compareTime - now.getTime()) / 1000));
            }
          };
          update();

          // Update every second.
          var interval = $interval(update, 1000);

          scope.click = function click() {
            scope.onClick();
          };

          // Register event listener for destroy.
          //   Cleanup interval.
          scope.$on('$destroy', function() {
            if (angular.isDefined(interval)) {
              $interval.cancel(interval);
              interval = undefined;
            }
          });
        }
      };
    }
  ]);
}).call(this);
