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
      for (var tag in tags) {
        if (tags.hasOwnProperty(tag)) {
          tag = tags[tag];
          currentScope.$emit('rfid.tag.detected', tag);
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
      currentScope.$emit('rfid.tag.detected', tag);
    }

    /**
     * Tag removed.
     *
     * @param tag
     *   The tag that was removed from the RFID.
     */
    function tagRemoved(tag) {
      currentScope.$emit('rfid.tag.removed', tag);
    }

    /**
     * Start listing for barcode events.
     *
     * @param scope
     *   The scope to emit events into when data is received.
     */
    this.start = function start(scope) {
      currentScope = scope;
      proxyService.on('rfid.tags.detected', tagsDetected);
      proxyService.on('rfid.tag.detected', tagDetected);
      proxyService.on('rfid.tag.removed', tagRemoved);

      proxyService.emit('rfid.tags.request');
    };

    /**
     * Stop listing for barcode events.
     */
    this.stop = function stop() {
      proxyService.removeListener('rfid.tags.detected', tagsDetected);
      proxyService.removeListener('rfid.tag.detected', tagDetected);
      proxyService.removeListener('rfid.tag.removed', tagRemoved);
      currentScope = null;
    };
  }
]);
