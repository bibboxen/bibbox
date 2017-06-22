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
      this.timestamp = rawTag.timestamp;
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
    function currentScopeHasMethod(method) {
      return currentScope[method] && typeof currentScope[method] === 'function';
    }

    /**
     * Tags detected.
     *
     * @param tags
     *   The tags that were detected by the RFID.
     */
    proxyService.on('rfid.tags.detected', function tagsDetected(data) {
      if (currentScope && currentScopeHasMethod('tagDetected')) {
        for (var i = 0; i < data.rawTags.length; i++) {
          currentScope.tagDetected(new Tag(data.rawTags[i]));
        }
      }
    });

    /**
     * Tag detected.
     *
     * @param tag
     *   The tag that was detected by the RFID.
     */
    proxyService.on('rfid.tag.detected', function tagDetected(data) {
      if (currentScope && currentScopeHasMethod('tagDetected')) {
        currentScope.tagDetected(new Tag(data.rawTag));
      }
    });

    /**
     * Tag removed.
     *
     * @param tag
     *   The tag that was removed from the RFID.
     */
    proxyService.on('rfid.tag.removed', function tagRemoved(data) {
      if (currentScope && currentScopeHasMethod('tagRemoved')) {
        currentScope.tagRemoved(new Tag(data.rawTag));
      }
    });

    /**
     * The AFI has been set.
     *
     * @param tag
     *   The tag where the AFI have been set.
     */
    proxyService.on('rfid.tag.afi.set', function tagAFISet(data) {
      if (currentScope && currentScopeHasMethod('tagAFISet')) {
        currentScope.tagAFISet(new Tag(data.rawTag));
      }
    });

    /**
     * RFID is processing.
     */
    proxyService.on('rfid.processing', function processing() {
      if (currentScope && currentScopeHasMethod('rfidProcessing')) {
        currentScope.rfidProcessing();
      }
    });

    /**
     * RFID error.
     *
     * @param err
     *   The error.
     */
    proxyService.on('rfid.error', function rfidError(err) {
      if (currentScope && currentScopeHasMethod('rfidError')) {
        currentScope.rfidError(err);
      }
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
        timestamp: new Date().getTime(),
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
