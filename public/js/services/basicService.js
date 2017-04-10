/**
 * @file
 * Handel barcode events.
 */

angular.module('BibBox').service('basicService', ['config',
  function (config) {
    'use strict';

    /**
     * Check if a given event message has expired.
     *
     * @param {int} timestamp
     *   Unit timestamp to compare.
     * @param {string} eventName
     *   The event (used for debugging).
     * @param {object} data
     *   The data send in the event.
     *
     * @returns {boolean}
     *   If expire true else false.
     */
    this.isEventExpired = function isEventExpired(timestamp, eventName, data) {
      var current = new Date().getTime();
      var eventTimeout = config.hasOwnProperty(eventTimeout) ? config.eventTimeout :  500;

      if (Number(timestamp) + eventTimeout < current) {
        if (config.hasOwnProperty('debug') && config.debug) {
          console.error('Event expired (' + ((Number(timestamp) + eventTimeout) - current) + ') ' + eventName, data);
        }
        return true;
      }

      if (config.hasOwnProperty('debug') && config.debug) {
        console.error('Event not expired (' + ((Number(timestamp) + eventTimeout) - current) + '): ' + eventName, data);
      }
      return false;
    };
  }
]);
