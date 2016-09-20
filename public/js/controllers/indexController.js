/**
 * Index page controller.
 */
angular.module('BibBox').controller('IndexController', ['$scope', '$http', '$window', '$location', '$translate', 'proxyService', 'config',
  function ($scope, $http, $window, $location, $translate, proxyService, config) {
    "use strict";

    $scope.running = false;

    // @TODO: Move this.
    proxyService.emitEvent('config.translations', 'config.translations.res', 'config.translations.error', 'config.translations.res').then(
      function success(translations) {
        config.translations = angular.copy(translations);
        $translate.refresh();
        $scope.running = true;
      },
      function error(err) {
        // @TODO: Handle error.
      }
    );

    $scope.buttons = [
      {
        "text": "menu.borrow",
        "url": "/#/login/borrow",
        "icon": "glyphicon-tasks"
      },
      {
        "text": "menu.status",
        "url": "/#/login/status",
        "icon": "glyphicon-refresh"
      },
      {
        "text": "menu.reservations",
        "url": "/#/login/reservations",
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

    /**
     * Change the language.
     *
     * @param langKey
     */
    $scope.changeLanguage = function changeLanguage(langKey) {
      $translate.use(langKey);
    }
  }
]);
