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

    // Start listening for rfid events.
    rfidService.start($scope);

    /**
     * Tag was removed from RFID device.
     *
     * @param tag
     */
    $scope.tagRemoved = function itemRemoved(tag) {
      var material = false;
      var i;

      // Restart idle timeout.
      $scope.baseResetIdleWatch();

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
          invalid: tag.seriesLength === 0 || tag.numberInSeries === 0
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
      return material.seriesLength > 0 && material.seriesLength === material.tags.length;
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
    $scope.updateMaterialAFI = function updateMaterialAFI(tag) {
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
     * Get number of materials that are processing.
     *
     * @returns {number}
     */
    $scope.baseGetProcessingResults = function baseGetProcessingResults() {
      var n = 0;

      for (var i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].loading) {
          n++;
        }
      }

      return n;
    };

    /**
     * Get number of materials that is in error state.
     *
     * @returns {number}
     */
    $scope.baseGetErrorResults = function baseGetErrorResults() {
      var n = 0;

      for (var i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].invalid || $scope.materials[i].status === 'return.error' || $scope.materials[i].status === 'borrow.error') {
          n++;
        }
      }

      return n;
    };

    /**
     * Get number of incomplete materials.
     *
     * @returns {number}
     */
    $scope.baseGetIncompleteMaterials = function baseGetIncompleteMaterials() {
      var n = 0;

      for (var i = 0; i < $scope.materials.length; i++) {
        if (!$scope.allTagsInSeries($scope.materials[i])) {
          n++;
        }
      }

      return n;
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
      // Restart idle timeout.
      $scope.baseResetIdleWatch();

      rfidService.setAFI(uid, afi);
    };

    /**
     * RFID error handler.
     *
     * @param err
     */
    $scope.rfidError = function rfidError(err) {
      console.log(err);
    };

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      rfidService.stop();
    });
  }
]);
