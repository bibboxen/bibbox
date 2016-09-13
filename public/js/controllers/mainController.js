/**
 * Index page.
 */
angular.module('BibBox').controller('IndexController', ['$scope', '$http', '$window', '$location', '$translate',
  function($scope, $http, $window, $location, $translate) {
    "use strict";

    $scope.buttons = [
      {
        "text": "menu.borrow",
        "url": "/#/borrow",
        "icon": "glyphicon-tasks"
      },
      {
        "text": "menu.status",
        "url": "/#/status",
        "icon": "glyphicon-refresh"
      },
      {
        "text": "menu.reservations",
        "url": "/#/reservations",
        "icon": "glyphicon-list-alt"
      },
      {
        "text": "menu.return",
        "url": "/#/return",
        "icon": "glyphicon-time"
      }
    ];

    $scope.languages = [
      {
        "text": "language.da",
        "langKey": "da",
        "icon": "img/flags/DK.png"
      },
      {
        "text": "language.en",
        "langKey": "en",
        "icon": "img/flags/GB.png"
      }
    ];

    $scope.changeLanguage = function changeLanguage(langKey) {
      $translate.use(langKey);
    }
  }
]);
