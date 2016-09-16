/**
 * Status page controller.
 */
angular.module('BibBox').controller('StatusController', ['$scope', '$http', '$window', '$location',
  function($scope, $http, $window, $location) {
    "use strict";

    $scope.materials = [
      {
        "title": "Harry Potter and the Cursed Child",
        "returnDate": 1233123112312,
        "newDate": 1603122412312,
        "bill": "70 kr",
        "information": ""
      },
      {
        "title": "Harry Potter and the Cursed Child",
        "returnDate": 1233123112312,
        "newDate": 1603122412312,
        "bill": "70 kr",
        "information": ""
      },
      {
        "title": "Harry Potter and the Cursed Child",
        "returnDate": 1233123112312,
        "newDate": 1603122412312,
        "bill": null,
        "information": ""
      },
      {
        "title": "Harry Potter and the Cursed Child",
        "returnDate": 1233123112312,
        "newDate": 1603122412312,
        "bill": "70 kr",
        "information": "Skal afleveres!!!"
      },
      {
        "title": "Harry Potter and the Cursed Child",
        "returnDate": 1233123112312,
        "newDate": 1603122412312,
        "bill": "70 kr",
        "information": ""
      },
      {
        "title": "Harry Potter and the Cursed Child",
        "returnDate": 1233123112312,
        "newDate": 1603122412312,
        "bill": "70 kr",
        "information": ""
      },
      {
        "title": "Harry Potter and the Cursed Child",
        "returnDate": 1233123112312,
        "newDate": 1603122412312,
        "bill": "70 kr",
        "information": ""
      }
    ];
  }
]);
