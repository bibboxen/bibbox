/**
 * @file
 * Borrow page controller.
 */

/**
 * Interface that child classes should implement.
 *
 * @function tagDetected
 *   @param A tag object from the RFID scanner.
 * @function tagAFISet
 *   @param A tag object from the RFID scanner.
 *
 * @type {Interface}
 */
RFIDBaseInterface = new Interface( 'RFIDBaseInterface', [
  'tagDetected',
  'tagAFISet'
]);

angular.module('BibBox').controller('RFIDBaseController', ['$scope', '$controller', 'rfidService',
  function ($scope, $controller, rfidService) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

    // Used to hold materials.
    $scope.materials = [];

    /**
     * Handler for when tag is detected.
     *
     * @param event
     *   The event.
     * @param tag
     *   The tag returned from the device.
     */
    $scope.$on('rfid.tagDetected', function tagDetected(event, tag) {
      $scope.baseResetIdleWatch();
      $scope.tagDetected(tag);
    });

    /**
     * Handler for when tag is removed.
     *
     * @param event
     *   The event.
     * @param tag
     *   The tag returned from the device.
     */
    $scope.$on('rfid.tagRemoved', function tagRemoved(event, tag) {
      $scope.baseResetIdleWatch();
      $scope.tagRemoved(tag);
    });

    /**
     * The AFI has been set for a tag.
     *
     * @param event
     *   The event.
     * @param tag
     *   The tag returned from the device.
     */
    $scope.$on('rfid.tagAFISet', function tagAFISet(event, tag) {
      $scope.baseResetIdleWatch();
      $scope.tagAFISet(tag);
    });

    // Start listening for RDIF events.
    rfidService.start($scope);

    /**
     * Tag was removed from RFID device.
     *
     * @param tag
     */
    $scope.tagRemoved = function itemRemoved(tag) {
      var material = false;
      var i;

      // Check if material has already been added to the list.
      for (i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].id === tag.mid) {
          material = $scope.materials[i];
          break;
        }
      }

      // If the material has not been added, ignore it.
      if (!material) {
        return;
      }

      // Mark tag as removed from the scanner.
      for (i = 0; i < material.tags.length; i++) {
        if (material.tags[i].uid === tag.uid) {
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
      var i;

      // Used to indicate that the tag have been removed from the RFID scanner,
      // before the processing has been completed.
      tag.removed = false;

      // Check if item has already been added to the list.
      for (i = 0; i < list.length; i++) {
        if (list[i].id === tag.mid) {
          material = list[i];
          break;
        }
      }

      // If material has not been added it to the list, add it.
      if (!material) {
        // Add a first version of the material.
        material = {
          id: tag.mid,
          seriesLength: tag.seriesLength,
          tags: [],
          title: tag.mid,
          loading: false,
          invalid: tag.seriesLength === 0 || tag.numberInSeries === 0 || parseInt(tag.mid) === 0
        };
        list.push(material);
      }

      // Add tag to material if not already added.
      var alreadyAdded = false;
      for (i = 0; i < material.tags.length; i++) {
        if (material.tags[i].uid === tag.uid) {
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
     * Have any of the tags been removed from the scanner.
     *
     * @param tags
     *   Array of tags.
     */
    $scope.anyTagRemoved = function anyTagRemoved(tags) {
      for (var i = 0; i < tags.length; i++) {
        if (tags[i].removed) {
          return true;
        }
      }

      return false;
    };

    /**
     * Are all the tags in the material.tags series present on the scanner.
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
          if ($scope.materials[i].tags[j].uid === tag.uid) {
            // Set material for later evaluation.
            material = $scope.materials[i];

            // Set AFI of tag.
            material.tags[j].afi = tag.afi;

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
