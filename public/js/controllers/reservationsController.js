/**
 * Reservations page controller.
 */
angular.module('BibBox').controller('ReservationsController', ['$scope', '$http', '$window', '$location',
  function($scope, $http, $window, $location) {
    "use strict";

    $scope.reservations = [
      {
        "title": "Cras justo odio",
        "status": "ready"
      },
      {
        "title": "Dapibus ac facilisis in",
        "status": ""
      },
      {
        "title": "Morbi leo risus",
        "status": "ready"
      },
      {
        "title": "Porta ac consectetur ac",
        "status": ""
      },
      {
        "title": "Vestibulum at eros",
        "status": ""
      },
      {
        "title": "Cras justo odio",
        "status": "ready"
      },
      {
        "title": "Dapibus ac facilisis in",
        "status": ""
      },
      {
        "title": "Morbi leo risus",
        "status": "ready"
      },
      {
        "title": "Porta ac consectetur ac",
        "status": ""
      },
      {
        "title": "Vestibulum at eros",
        "status": ""
      }
    ];
  }
]);
