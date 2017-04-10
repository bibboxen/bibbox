/**
 * @file
 * Handles rfid events.
 */

angular.module('BibBox').factory('rfidService', ['$q', '$rootScope', 'basicService', 'proxyService',
  function ($q, $rootScope, basicService, proxyService) {
    'use strict';

    // Extend this service with the basicService. It's copy to ensure that it is
    // not overridden, if not copy the extend will return an reference.
    var service = angular.extend(angular.copy(basicService), {});

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
    proxyService.on('rfid.tags.detected', function tagsDetected(data) {
      if (currentScope && hasMethod('tagDetected') && !service.isEventExpired(data.timestamp, 'fbs.login.success', data)) {
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
      if (currentScope && hasMethod('tagDetected') && !service.isEventExpired(data.timestamp, 'fbs.login.success', data)) {
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
      if (currentScope && hasMethod('tagRemoved') && !service.isEventExpired(data.timestamp, 'fbs.login.success', data)) {
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
      if (currentScope && hasMethod('tagAFISet') && !service.isEventExpired(data.timestamp, 'fbs.login.success', data)) {
        currentScope.tagAFISet(new Tag(data.rawTag));
      }
    });

    /**
     * RFID is processing.
     */
    proxyService.on('rfid.processing', function processing() {
      if (currentScope && hasMethod('rfidProcessing')) {
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
      if (currentScope && hasMethod('rfidError') && !service.isEventExpired(err.timestamp, 'fbs.login.success', err)) {
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
    service.setAFI = function setAFI(uid, afi) {
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
    service.start = function start(scope) {
      currentScope = scope;

      proxyService.emit('rfid.tags.request');
    };

    /**
     * Stop listing for barcode events.
     */
    service.stop = function stop() {
      currentScope = null;
    };

    return service;
  }
]);
