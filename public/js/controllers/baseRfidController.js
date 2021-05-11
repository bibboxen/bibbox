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
 * @interface
 *
 * @type {Interface}
 */
RFIDBaseInterface = new Interface( 'RFIDBaseInterface', [
  'tagDetected',
  'tagAFISet'
]);

angular.module('BibBox').controller('RFIDBaseController', ['$scope', '$controller', 'rfidService', 'loggerService', 'config', '$modal', '$analytics',
  function ($scope, $controller, rfidService, loggerService, config, $modal, $analytics) {
    'use strict';

    // Instantiate/extend base controller.
    $controller('BaseController', { $scope: $scope });

    // Used to hold materials.
    $scope.materials = [];

    // Materials that have been borrowed, but not been unlocked.
    $scope.lockedMaterials = [];

    /**
     * Setup tag missing modal.
     *
     * Has a locked backdrop, that does not disappear when clicked.
     */
    $scope.tagMissingModal = $modal({
      scope: $scope,
      templateUrl: './views/modal_tag_missing.html',
      show: false,
      backdrop: 'static'
    });

    /**
     * Check if the modal should be shown.
     */
    $scope.checkMissingTags = function checkMissingTags() {
      if ($scope.tagMissingModal) {
        $scope.tagMissingModal.$promise.then(function() {
          if ($scope.lockedMaterials.length > 0) {
            // Reset time to double time for users to has time to react.
            $scope.baseResetIdleWatch(config.timeout.idleTimeout);

            $analytics.eventTrack('tagMissing', {  category: 'Missing', label: 'Material not on scanner' });
            $scope.tagMissingModal.show();
          }
          else {
            $analytics.eventTrack('tagMissing', {  category: 'Missing', label: 'Material replaced on scanner' });
            $scope.tagMissingModal.hide();
          }
        });
      }
    };

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
          invalid: tag.seriesLength === 0 || tag.numberInSeries === 0,
          borrowed: false
        };
        list.push(material);
      }

      // Add tag to material if not already added.
      var alreadyAdded = false;
      for (i = 0; i < material.tags.length; i++) {
        if (material.tags[i].uid === tag.uid && material.tags[i].mid === tag.mid) {
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
     * Have all number in series at least one tag that has the correct AFI value?
     *
     * @param {Array} tags
     *   Array of tags to investigate.
     * @param {boolean} afi
     *   The AFI value that should be set.
     * @param {number} seriesLength
     *   The number of elements in the series.
     *
     * @return {boolean}
     *   Returns true if all tags in the series have been set correctly, else returns false.
     */
    $scope.allTagsInSeriesSetCorrect = function allTagsInSeriesSetCorrect(tags, afi, seriesLength) {
      // This count of unique series numbers is to counter an issue with the
      // RFID reading a tag UUID wrong, so its gets added twice.
      var uniqueSeriesNumbers = {};
      for (var i = 0; i < tags.length; i++) {
        if (tags[i].afi === afi) {
          uniqueSeriesNumbers['tag' + tags[i].numberInSeries] = true;
        }
      }

      // Series length should be greater than zero, and each tag in the series must be present.
      return seriesLength === Object.keys(uniqueSeriesNumbers).length;
    };

    /**
     * Are all the tags in the material.tags series present on the scanner.
     *
     * @param material
     */
    $scope.allTagsInSeries = function allTagsInSeries(material) {
      // This count of unique series numbers is to counter an issue with the
      // RFID reading a tag UUID wrong, so its gets added twice.
      var uniqueSeriesNumbers = {};
      for (var i = 0; i < material.tags.length; i++) {
        uniqueSeriesNumbers['tag' + material.tags[i].numberInSeries] = true;
      }

      // Series length should be greater than zero, and each tag in the series must be present.
      return material.seriesLength > 0 && material.seriesLength === Object.keys(uniqueSeriesNumbers).length;
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
      var material;
      var materials = $scope.materials;

      // Locate tag.
      for (var i = 0; i < materials.length; i++) {
        for (var j = 0; j < materials[i].tags.length; j++) {
          // If the tag is located.
          if (materials[i].tags[j].uid === tag.uid && materials[i].tags[j].mid === tag.mid) {
            // Set material for later evaluation.
            material = materials[i];

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
     * Validate that the tag has valid data.
     *
     * @param {Object} tag
     *   The tag.
     *
     * @return {boolean}
     *   True if the tag is valid, else false.
     */
    $scope.tagValid = function tagValid(tag) {
      return tag && tag.afi !== undefined
        && tag.mid !== undefined && tag.uid !== undefined
        && tag.numberInSeries !== undefined && tag.seriesLength !== undefined;
    };

    /**
     * Get number of materials that are processing.
     *
     * @returns {number}
     */
    $scope.baseGetProcessingResults = function baseGetProcessingResults() {
      var numberOfProcessingResults = 0;

      for (var i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].loading) {
          numberOfProcessingResults++;
        }
      }

      return numberOfProcessingResults;
    };

    /**
     * Get number of materials that is in error state.
     *
     * @returns {number}
     */
    $scope.baseGetErrorResults = function baseGetErrorResults() {
      var numberOfErrorResults = 0;

      for (var i = 0; i < $scope.materials.length; i++) {
        if ($scope.materials[i].invalid || $scope.materials[i].status === 'error') {
          numberOfErrorResults++;
        }
      }

      return numberOfErrorResults;
    };

    /**
     * Get number of incomplete materials.
     *
     * @returns {number}
     */
    $scope.baseGetIncompleteMaterials = function baseGetIncompleteMaterials() {
      var numberOfIncompleteMaterials = 0;

      for (var i = 0; i < $scope.materials.length; i++) {
        if (!$scope.allTagsInSeries($scope.materials[i])) {
          numberOfIncompleteMaterials++;
        }
      }

      return numberOfIncompleteMaterials;
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
     * RFID is processing.
     */
    $scope.rfidProcessing = function rfidProcessing() {
      // Hack to circumvent angular's slow digest cycle.
      angular.element('.image-help--image').hide();
      angular.element('.image-help--processing').show();
    };

    /**
     * RFID error handler.
     *
     * @param err
     */
    $scope.rfidError = function rfidError(err) {
      loggerService.error(err);
    };

    // Start listening for rfid events.
    rfidService.start($scope);

    /**
     * On destroy.
     */
    $scope.$on('$destroy', function () {
      // Make sure tag missing modal is removed.
      $scope.tagMissingModal.$promise.then(function() {
        $scope.tagMissingModal.hide();
        $scope.tagMissingModal.destroy();
      });

      // Stop listening for RFID events.
      rfidService.stop();
    });
  }
]);
