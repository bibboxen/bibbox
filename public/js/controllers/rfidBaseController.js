/**
 * @file
 * Borrow page controller.
 */

angular.module('BibBox').controller('RFIDBaseController', ['$scope', '$controller', 'rfidService',
  function ($scope, $controller, rfidService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

    /**
     * Handler for when tag is detected.
     *
     * @param event
     * @param tag
     */
    function tagDetected(event, tag) {
      $scope.baseResetIdleWatch();

      if ($scope.tagDetected) {
        $scope.tagDetected(tag);
      }
    }

    /**
     * Handler for when tag is removed.
     *
     * @param event
     * @param tag
     */
    function tagRemoved(event, tag) {
      $scope.baseResetIdleWatch();

      if ($scope.tagRemoved) {
        $scope.tagRemoved(tag);
      }
    }

    /**
     * The AFI has been set for a tag.
     *
     * @param event
     * @param tag
     */
    function tagAFISet(event, tag) {
      $scope.baseResetIdleWatch();

      if ($scope.tagAFISet) {
        $scope.tagAFISet(tag);
      }
    }

    $scope.$on('rfid.tag.detected', tagDetected);
    $scope.$on('rfid.tag.removed', tagRemoved);
    $scope.$on('rfid.tag.afi.set', tagAFISet);

    // Start listening for rfid events.
    rfidService.start($scope);

    /**
     * Adds a tag to the proper material in a list.
     *
     * @param tag
     *   The tag to add.
     * @param list
     *   The list to add the material to.
     */
    $scope.addTag = function addMaterial(tag, list) {
      var material = null;
      var id = tag.MID.slice(6);
      var i;

      var seriesLength = parseInt(tag.MID.slice(2, 4));

      tag.numberInSeries = parseInt(tag.MID.slice(4, 6));
      tag.seriesLength = seriesLength;

      // Check if item has already been added to the list.
      for (i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          material = list[i];
          break;
        }
      }

      // If item have not been added it to the scope (UI list).
      if (!material) {
        // Add a first version of the material.
        material = {
          id: id,
          seriesLength: seriesLength,
          tags: [],
          title: id,
          loading: true
        };
        list.push(material);
      }

      // Add tag to material if not already added.
      var alreadyAdded = false;
      for (i = 0; i < material.tags.length; i++) {
        if (material.tags[i].UID === tag.UID) {
          alreadyAdded = true;
          break;
        }
      }
      if (!alreadyAdded) {
        material.tags.push(tag);
      }

      return material;
    };

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      rfidService.stop();
    });
  }
]);