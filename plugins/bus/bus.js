/**
 * @file
 * Defines an event bus to send messages between plugins.
 */

'use strict';

// Get event emitter: https://github.com/asyncly/EventEmitter2
var EventEmitter2 = require('eventemitter2').EventEmitter2;

/**
 * Register the plugin with architect.
 *
 * @param {array} options
 *   Options defined in app.js.
 * @param {array} imports
 *   The other plugins available.
 * @param {function} register
 *   Callback function used to register this plugin.
 */
module.exports = function (options, imports, register) {
  var emitter = new EventEmitter2({
    wildcard: true,
    delimiter: '.',
    newListener: false,
    maxListeners: 20
  });

  var events = {};

  /**
   * Remove events from book keeping.
   *
   * @param {string} type
   *   Event type to remove.
   */
  function removeEvent(type) {
    if (events.hasOwnProperty(type)) {
      var eventName = events[type];

      // Clean up book keeping books.
      delete events[type];
      delete events[eventName];

      // Remove the unused listener.
      emitter.removeAllListeners(eventName);
    }
  }

  /**
   * Emit event wrapper to do booking.
   *
   * This exist to remove unused listeners to prevent memory leaks.
   *
   * @param {string} type
   *   The event type/name.
   * @param {*} data
   *   The data emitted.
   */
  emitter.emitBibboxWrapper = function(type, data) {
    if (Object.prototype.toString.call(data) === '[object Object]') {
      if (data.hasOwnProperty('busEvent') && data.hasOwnProperty('errorEvent')) {
        // We use the same pattern to send events into the bus. So we do some
        // book keeping to be able to remove the unused event handler and free
        // memory.
        events[data.busEvent] = data.errorEvent;
        events[data.errorEvent] = data.busEvent;
      }
    }

    // Send the event on the the normal handler.
    emitter.emit.apply(this, arguments);
  };

  /**
   * Once wrapper to remove unused listeners.
   *
   * @param {string} type
   *   The event type/name.
   */
  emitter.onceBibboxWrapper = function(type) {
    removeEvent(type);

    // Send the event on the the normal handler.
    emitter.once.apply(this, arguments);
  };

  /**
   * RemoveListener wrapper to remove unused listeners.
   *
   * @param {string} type
   *   The event type/name.
   */
  emitter.removeListenerBibboxWrapper = function(type) {
    removeEvent(type);

    // Send the event on the the normal handler.
    emitter.removeListener.apply(this, arguments);
  };

  /**
   * RemoveAllListeners wrapper to remove unused listeners.
   *
   * @param {string} type
   *   The event type/name.
   */
  emitter.removeAllListenersBibboxWrapper = function(type) {
    removeEvent(type);

    // Send the event on the the normal handler.
    emitter.removeAllListeners.apply(this, arguments);
  };

  register(null, {
    bus: {
      emit: emitter.emitBibboxWrapper,
      onAny: emitter.onAny,
      offAny: emitter.offAny,
      on: emitter.on,
      off: emitter.off,
      once: emitter.onceBibboxWrapper,
      many: emitter.many,
      removeListener: emitter.removeListenerBibboxWrapper,
      removeAllListeners: emitter.removeAllListenersBibboxWrapper
    }
  });
};
