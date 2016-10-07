angular.module('BibBox').service('logoutService', ['$timeout', '$location', 'config',
  function ($timeout, $location, config) {
    'use strict';

    var self = this;

    // Log out timer.
    var timer = null;

    self.cancelTimer = function () {
      if (timer) {
        if (angular.isDefined(timer)) {
          $timeout.cancel(timer);
        }
      }
    };

    self.startTimer = function startTimer() {
      self.cancelTimer();

      timer = $timeout(function () {
        $location.path('/');
      }, config.timeout);

      var now = new Date();
      return now.getTime() + config.timeout;
    };
  }
]);