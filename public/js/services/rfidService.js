/**
 * @file
 * Handles rfid events.
 */

angular.module('BibBox').service('rfidService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

    var currentScope = null;

    /**
     * Tags detected.
     *
     * @param tags
     *   The tags that were detected by the RFID.
     */
    function tagsDetected(tags) {
      if (currentScope) {
        for (var i = 0; i < tags.length; i++) {
          currentScope.$emit('rfid.tagDetected', tags[i]);
        }
      }
    }

    /**
     * Tag detected.
     *
     * @param tag
     *   The tag that was detected by the RFID.
     */
    function tagDetected(tag) {
      if (currentScope) {
        currentScope.$emit('rfid.tagDetected', tag);
      }
    }

    /**
     * Tag removed.
     *
     * @param tag
     *   The tag that was removed from the RFID.
     */
    function tagRemoved(tag) {
      if (currentScope) {
        currentScope.$emit('rfid.tagRemoved', tag);
      }
    }

    /**
     * The AFI has been set.
     *
     * @param tag
     *   The tag where the AFI have been set.
     */
    function tagAFISet(tag) {
      if (currentScope) {
        currentScope.$emit('rfid.tagAFISet', tag);
      }
    }

    /**
     * RFID error.
     *
     * @param err
     *   The error.
     */
    function rfidError(err) {
      console.log('rfidErorr', err);
      // @TODO: Handle.
    }

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
      var deferred = $q.defer();

      proxyService.emit('rfid.tag.set_afi', {
        UID: uid,
        AFI: afi
      });

      return deferred.promise;
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

    // Register listeners.
    proxyService.on('rfid.tags.detected', tagsDetected);
    proxyService.on('rfid.tag.detected', tagDetected);
    proxyService.on('rfid.tag.removed', tagRemoved);
    proxyService.on('rfid.tag.afi.set', tagAFISet);
    proxyService.on('rfid.error', rfidError);
  }
]);
