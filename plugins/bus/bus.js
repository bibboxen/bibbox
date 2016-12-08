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

  register(null, {
    bus: {
      emit: emitter.emit,
      onAny: emitter.onAny,
      offAny: emitter.offAny,
      on: emitter.on,
      off: emitter.off,
      once: emitter.once,
      many: emitter.many,
      removeListener: emitter.removeListener,
      removeAllListeners: emitter.removeAllListeners
    }
  });
};
