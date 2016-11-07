/**
 * @file
 * Handles rfid events.
 */

angular.module('BibBox').service('rfidService', ['$q', 'proxyService',
  function ($q, proxyService) {
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
      this.uid = rawTag.UID;

      // The first 6 chars in the tag MID is not part of the the ID, but used
      // to indicate part of series.
      if (rawTag.hasOwnProperty('MID')) {
        this.mid = rawTag.MID.slice(6);
        this.seriesLength = parseInt(rawTag.MID.slice(2, 4));
        this.numberInSeries = parseInt(rawTag.MID.slice(4, 6));
      }

      this.afi = rawTag.AFI;
    };

    /**
     * Tags detected.
     *
     * @param tags
     *   The tags that were detected by the RFID.
     */
    proxyService.on('rfid.tags.detected', function tagsDetected(rawTags) {
      if (currentScope) {
        for (var i = 0; i < rawTags.length; i++) {
          currentScope.$emit('rfid.tagDetected', new Tag(rawTags[i]));
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
      if (currentScope) {
        currentScope.$emit('rfid.tagDetected', new Tag(rawTag));
      }
    });

    /**
     * Tag removed.
     *
     * @param tag
     *   The tag that was removed from the RFID.
     */
    proxyService.on('rfid.tag.removed', function tagRemoved(rawTag) {
      if (currentScope) {
        currentScope.$emit('rfid.tagRemoved', new Tag(rawTag));
      }
    });

    /**
     * The AFI has been set.
     *
     * @param tag
     *   The tag where the AFI have been set.
     */
    proxyService.on('rfid.tag.afi.set', function tagAFISet(rawTag) {
      if (currentScope) {
        currentScope.$emit('rfid.tagAFISet', new Tag(rawTag));
      }
    });

    /**
     * RFID error.
     *
     * @param err
     *   The error.
     */
    proxyService.on('rfid.error', function rfidError(err) {
      if (currentScope) {
        // @TODO: Handle.
        console.log('rfidErorr', err);
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
      var deferred = $q.defer();

      proxyService.emit('rfid.tag.set_afi', {
        UID: uid,
        AFI: afi
      }).then(function () {
        deferred.resolve();
      }, function (err) {
        deferred.reject(err);
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
  }
]);
