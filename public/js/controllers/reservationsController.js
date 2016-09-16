/**
 * Reservations page controller.
 */
angular.module('BibBox').controller('ReservationsController', ['$scope',
  function($scope) {
    "use strict";

    $scope.materials = [
      {
        "title": "Harry Potter and the Cursed Child",
        "barcode": "123129902139",
        "ready": false,
        "reservation_number": 2,
        "information": ""
      },
      {
        "title": "Dapibus ac facilisis in",
        "barcode": "123129902139",
        "ready": true,
        "reservation_number": 1,
        "information": ""
      },
      {
        "title": "Morbi leo risus",
        "barcode": "123129902139",
        "ready": false,
        "reservation_number": 111,
        "information": ""
      },
      {
        "title": "Porta ac consectetur ac",
        "barcode": "123129902139",
        "ready": false,
        "reservation_number": 10,
        "information": ""
      },
      {
        "title": "Vestibulum at eros",
        "barcode": "123129902139",
        "ready": true,
        "reservation_number": 1,
        "information": ""
      },
      {
        "title": "Cras justo odio",
        "barcode": "123129902139",
        "ready": false,
        "reservation_number": 50,
        "information": ""
      },
      {
        "title": "Dapibus ac facilisis in",
        "barcode": "123129902139",
        "ready": true,
        "reservation_number": 1,
        "information": "Hovedbiblioteket"
      },
      {
        "title": "Morbi leo risus",
        "barcode": "123129902139",
        "ready": false,
        "reservation_number": 63,
        "information": ""
      },
      {
        "title": "Porta ac consectetur ac",
        "barcode": "123129902139",
        "ready": false,
        "reservation_number": 32,
        "information": ""
      },
      {
        "title": "Vestibulum at eros",
        "barcode": "123129902139",
        "ready": false,
        "reservation_number": 32,
        "information": ""
      }
    ];
  }
]);
