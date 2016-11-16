/**
 * @file
 * Handles rfid events.
 */

angular.module('BibBox').service('rfidService', ['$q', '$rootScope', 'proxyService',
  function ($q, $rootScope, proxyService) {
    'use strict';

    var currentScope = null;

    /**
     * Tag object.
     *
     * Parses the raw tag object from the scanner.
     *
     * @TODO: Move this to Java program.
     *
     * @param rawTag
     *   Raw tag information from the scanner.
     */
    var Tag = function Tag(rawTag) {
      this.uid = rawTag.uid;
      this.mid = rawTag.mid;
      this.numberInSeries = rawTag.numberInSeries;
      this.seriesLength = rawTag.seriesLength;
      this.afi = rawTag.afi;
    };

    /**
     * Helper function to check current scope for a give method.
     *
     * @param method
     *   Method to lookup
     *
     * @returns {*|boolean}
     *   True if it exists else false.
     */
    function hasMethod(method) {
      return currentScope[method] && typeof currentScope[method] === 'function';
    }

    /**
     * Tags detected.
     *
     * @param tags
     *   The tags that were detected by the RFID.
     */
    proxyService.on('rfid.tags.detected', function tagsDetected(rawTags) {
      if (currentScope && hasMethod('tagDetected')) {
        for (var i = 0; i < rawTags.length; i++) {
          currentScope.tagDetected(new Tag(rawTags[i]));
        }
      }
    });

    /**
     * Tag detected.
     *
     * @param tag
     *   The tag that was detected by the RFID.
     */
    proxyService.on('rfid.tag.detected', function tagDetected(rawTag) {
      if (currentScope && hasMethod('tagDetected')) {
        currentScope.tagDetected(new Tag(rawTag));
      }
    });

    /**
     * Tag removed.
     *
     * @param tag
     *   The tag that was removed from the RFID.
     */
    proxyService.on('rfid.tag.removed', function tagRemoved(rawTag) {
      if (currentScope && hasMethod('tagRemoved')) {
        currentScope.tagRemoved(new Tag(rawTag));
      }
    });

    /**
     * The AFI has been set.
     *
     * @param tag
     *   The tag where the AFI have been set.
     */
    proxyService.on('rfid.tag.afi.set', function tagAFISet(rawTag) {
      if (currentScope && hasMethod('tagAFISet')) {
        currentScope.tagAFISet(new Tag(rawTag));
      }
    });

    /**
     * RFID error.
     *
     * @param err
     *   The error.
     */
    proxyService.on('rfid.error', function rfidError(err) {
      if (currentScope && hasMethod('rfidError')) {
        currentScope.rfidError(err);
      }
    });

    // Listen for disconnection with the backend.
    proxyService.on('rfid.closed', function() {
      $rootScope.$emit('out-of-order.enable', 'rfid');
    });

    // Listen for connection with the backend.
    proxyService.on('rfid.connected', function() {
      $rootScope.$emit('out-of-order.disable', 'rfid');
    });

    /**
     * Turn the AFI on/off of the tag.
     *
     * @param uid
     *   The uid of the tag to set.
     * @param afi
     *   The value (true/false) to the in the AFI.
     * @returns {Function}
     */
    this.setAFI = function setAFI(uid, afi) {
      proxyService.emit('rfid.tag.set_afi', {
        uid: uid,
        afi: afi
      });
    };

    /**
     * Start listing for barcode events.
     *
     * @param scope
     *   The scope to emit events into when data is received.
     */
    this.start = function start(scope) {
      currentScope = scope;

      proxyService.emit('rfid.tags.request');
    };

    /**
     * Stop listing for barcode events.
     */
    this.stop = function stop() {
      currentScope = null;
    };
  }
]);
