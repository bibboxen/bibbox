/**
 * @file
 * Error directive to display errors (out-of-order).
 */

/**
 * Setup the module.
 *
 * @NOTE: The template is inline, as it have to be shown when the nodejs part is
 *        down and can't server template files.
 */
(function () {
  'use strict';

  angular.module('BibBox').directive('error', ['$rootScope', 'config', 'configService'
    function ($rootScope, config, configService) {
      return {
        restrict: 'E',
        replace: false,
        link: function (scope) {
          scope.debug = config.debug;

          // Assume we are out of order.
          scope.outOfOrder = true;

          if (!$rootScope.hasOwnProperty('outOfOrderLocks')) {
            // Assume 'nodejs' is connected.
            $rootScope.outOfOrderLocks = ['rfid'];

            if (!config.initialized) {
              $rootScope.outOfOrderLocks.push('config');
            }

            if (!config.translationsInitialized) {
              $rootScope.outOfOrderLocks.push('translations');
            }
          }
          else {
            scope.outOfOrder = $rootScope.outOfOrderLocks.length > 0;
          }

          // Listen to out of order enable overlay events.
          $rootScope.$on('out-of-order.enable', function (event, type) {
            $rootScope.outOfOrderLocks.push(type);

            // Error; so enable the overlay.
            scope.outOfOrder = true;
          });

          // Listen to out of order disable overlay events.
          $rootScope.$on('out-of-order.disable', function (event, type) {
            var index = $rootScope.outOfOrderLocks.indexOf(type);
            if (index !== -1) {
              $rootScope.outOfOrderLocks.splice(index, 1);
            }

            // Check if it should be disabled. It's only disabled if all errors
            // are resolved.
            scope.outOfOrder = $rootScope.outOfOrderLocks.length > 0;
          });

          scope.outOfOrderLocks = $rootScope.outOfOrderLocks;
        },
        template: `
<div  data-ng-if="outOfOrder" class="error-overlay">
  <nav class="navbar navbar-default navbar-absolute-top">
    <div>
      <div class="row row-nav">
        <div class="col-xs-6 col-md-4"><div class="logo-container"><a href="/"><img src="img/aarhus.png" class="logo"></a></div></div>
        <div class="col-xs-6 col-md-4 text-center"></div>
        <div class="col-xs-6 col-md-4"></div>
      </div>
    </div>
  </nav>

  <div class="error-content">
    <span class="error">{{ 'out_of_order.text' | translate }}</span>
    <div ng-if="debug" ng-repeat="outOfOrderLock in outOfOrderLocks">
      <span class="error">{{ outOfOrderLock }}</span>
    </div>
  </div>
</div>`
      };
    }
  ]);
}).call(this);
