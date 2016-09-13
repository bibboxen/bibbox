/**
 * Index page.
 */
angular.module('BibBox').controller('IndexController', ['$scope', '$http', '$window', '$location',
  function($scope, $http, $window, $location) {
    "use strict";

    $scope.buttons = [
      {
        "text": "Udlån",
        "url": '/#/borrow'
      }
    ];
  }
]);
