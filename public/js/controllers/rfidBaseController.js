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
     *   The event.
     * @param tag
     *   The tag returned from the device.
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
     *   The event.
     * @param tag
     *   The tag returned from the device.
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
     *   The event.
     * @param tag
     *   The tag returned from the device.
     */
    function tagAFISet(event, tag) {
      $scope.baseResetIdleWatch();

      if ($scope.tagAFISet) {
        $scope.tagAFISet(tag);
      }
    }

    // Register event listeners for RFID events.
    $scope.$on('rfid.tag.detected', tagDetected);
    $scope.$on('rfid.tag.removed', tagRemoved);
    $scope.$on('rfid.tag.afi.set', tagAFISet);

    // Start listening for rfid events.
    rfidService.start($scope);

    /**
     * Tag was removed from RFID device.
     * 
     * @param tag
     */
    $scope.tagRemoved = function itemRemoved(tag) {
      var material = null;
      var id = tag.MID.slice(6);
      var i;

      // Check if material has already been added to the list.
      for (i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].id === id) {
          material = $scope.materials[i];
          break;
        }
      }

      // If the material has not been added, ignore it.
      if (!material) {
        return;
      }

      // Remove tag from material.
      for (i = 0; i < material.tags.length; i++) {
        if (material.tags[i].UID === tag.UID) {
          material.tags[i].removed = true;

          break;
        }
      }
    };

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

      // Set tag info.
      tag.numberInSeries = parseInt(tag.MID.slice(4, 6));
      tag.seriesLength = seriesLength;
      tag.removed = false;

      // Check if item has already been added to the list.
      for (i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          material = list[i];
          break;
        }
      }

      // If material has not been added it to the list, add it.
      if (!material) {
        // Add a first version of the material.
        material = {
          id: id,
          seriesLength: seriesLength,
          tags: [],
          title: id,
          loading: false,
          invalid: tag.seriesLength === 0 || tag.numberInSeries === 0 || parseInt(id) === 0
        };
        list.push(material);
      }

      // Add tag to material if not already added.
      var alreadyAdded = false;
      for (i = 0; i < material.tags.length; i++) {
        if (material.tags[i].UID === tag.UID) {
          // Mark the tag as not-removed from device.
          material.tags[i].removed = false;

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
     * Have any of the tags been removed?
     *
     * @param tags
     *   Array of tags.
     */
    $scope.anyTagRemoved = function nonRemoved(tags) {
      for (var i = 0; i < tags.length; i++) {
        if (tags[i].removed) {
          return true;
        }
      }

      return false;
    };

    /**
     * Are all the tags in the material.tags series present?
     *
     * @param material
     */
    $scope.allTagsInSeries = function allTagsInSeries(material) {
      return material.seriesLength === material.tags.length;
    };

    /**
     * Set AFI on Tag and return material.
     *
     * @param tag
     *   The tag that has been set AFI on.
     *
     * @returns material
     *   The material that contains the tag.
     */
    $scope.setAFIonTagReturnMaterial = function setAFIonTagReturnMaterial(tag) {
      var i, j, material;

      // Locate tag.
      for (i = 0; i < $scope.materials.length; i++) {
        for (j = 0; j < $scope.materials[i].tags.length; j++) {
          // If the tag is located.
          if ($scope.materials[i].tags[j].UID === tag.UID) {
            // Set material for later evaluation.
            material = $scope.materials[i];

            // Set AFI of tag.
            material.tags[j].AFI = tag.AFI;

            // Tag found, break loop.
            break;
          }
        }
        // If material found, break loop.
        if (material) {
          break;
        }
      }

      return material;
    };

    /**
     * Set the AFI on tag with UID.
     *
     * @param uid
     *   UID of tag to set AFI for.
     * @param afi
     *   boolean: AFI on/off.
     */
    $scope.setAFI = function setAFI(uid, afi) {
      rfidService.setAFI(uid, afi);
    };

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      rfidService.stop();
    });
  }
]);
