/**
 * Index page controller.
 */
angular.module('BibBox').controller('IndexController', ['$scope', '$http', '$window', '$location', '$translate', 'proxyService', 'config', 'tmhDynamicLocale',
  function ($scope, $http, $window, $location, $translate, proxyService, config, tmhDynamicLocale) {
    "use strict";

    $scope.running = false;

    /**
     * Request translations from backend.
     */
    proxyService.emitEvent('config.translations.request', 'config.translations', 'config.translations.error', {"busEvent": "config.translations"}).then(
      function success(data) {
        $scope.running = true;
      },
      function error(err) {
        // @TODO: Handle error.
      }
    );

    // @TODO: Make this configurable.
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

    // @TODO: Make this configurable.
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
      tmhDynamicLocale.set(langKey);
    }
  }
]);
