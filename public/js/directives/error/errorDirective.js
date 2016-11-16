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

  angular.module('BibBox').directive('error', [
    function () {
      return {
        restrict: 'E',
        replace: false,
        template: `
<div class="error-overlay">
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
  </div>
</div>`
      };
    }
  ]);
}).call(this);
