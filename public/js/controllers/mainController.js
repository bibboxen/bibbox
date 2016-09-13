/**
 * Index page.
 */
angular.module('BibBox').controller('IndexController', ['$scope', '$http', '$window', '$location',
  function($scope, $http, $window, $location) {
    "use strict";

    $scope.buttons = [
      {
        "text": "Udlån",
        "url": "/#/borrow",
        "icon": "glyphicon-tasks"
      },
      {
        "text": "Status/Forny",
        "url": "/#/status",
        "icon": "glyphicon-refresh"
      },
      {
        "text": "Reservationer",
        "url": "/#/reservations",
        "icon": "glyphicon-list-alt"
      },
      {
        "text": "Aflevering",
        "url": "/#/return",
        "icon": "glyphicon-time"
      }
    ];
  }
]);
