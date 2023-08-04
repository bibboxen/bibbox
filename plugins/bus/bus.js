/**
 * @file
 * Defines an event bus to send messages between plugins.
 */

'use strict';

// Get event emitter: https://github.com/asyncly/EventEmitter2
let EventEmitter2 = require('eventemitter2').EventEmitter2;

/**
 * The Bus object.
 *
 * @constructor
 */
var Bus = function Bus() {
  let emitter = new EventEmitter2({
    wildcard: true,
    delimiter: '.',
    newListener: false,
    maxListeners: 20
  });

  /**
   * The object (JSON) to keep track of once events on the bus.
   *
   * @type {Object}
   */
  let events = {};

  let self = this;

  /**
   * Remove events from bookkeeping.
   *
   * @param {string} type
   *   Event type to remove.
   */
  this.removeEvent = function removeEvent(type) {
    if (events.hasOwnProperty(type)) {
      let eventName = events[type];

      // Clean up bookkeeping books.
      delete events[type];
      delete events[eventName];

      // Remove the unused listener.
      emitter.removeAllListeners(eventName);
    }
  };

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
        // bookkeeping to be able to remove the unused event handler and free
        // memory.
        // The reason we swap bus/errorEvent is that these entries are used with
        // once listeners. When an busEvent once handler is invoked, the
        // errorEvent once handler will need to be removed.
        events[data.busEvent] = data.errorEvent;
        events[data.errorEvent] = data.busEvent;
      }
    }

    // Send the event on the normal handler.
    emitter.emit.apply(this, arguments);
  };

  /**
   * RemoveListener wrapper to remove unused listeners.
   *
   * @param {string} type
   *   The event type/name.
   */
  emitter.removeListenerBibboxWrapper = function(type) {
    self.removeEvent(type);

    // Send the event on the normal handler.
    emitter.removeListener.apply(this, arguments);
  };

  /**
   * RemoveAllListeners wrapper to remove unused listeners.
   *
   * @param {string} type
   *   The event type/name.
   */
  emitter.removeAllListenersBibboxWrapper = function(type) {
    self.removeEvent(type);

    // Send the event on the normal handler.
    emitter.removeAllListeners.apply(this, arguments);
  };

  /**
   * Expose event emitter 2 functions a wrappers on the object.
   */
  this.emit = emitter.emitBibboxWrapper;
  this.onAny = emitter.onAny;
  this.offAny = emitter.offAny;
  this.on = emitter.on;
  this.off = emitter.off;
  this.once = emitter.once;
  this.many = emitter.many;
  this.removeListener = emitter.removeListenerBibboxWrapper;
  this.removeAllListeners = emitter.removeAllListenersBibboxWrapper;
};

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
  let bus = new Bus();

  /**
   * Listen to all events.
   *
   * Ensures that events that are registered in "emitBibboxWrapper" which has
   * the pattern with "busEvent" and "errorEvent" is remove and the unused event
   * listener is removed.
   *
   * @param {string} type
   *   The event name.
   * @param {*} value
   *   The value sent with the event.
   */
  bus.onAny(function (type, value) {
    this.removeEvent(type);
  });

  register(null, {
    bus: bus
  });
};
