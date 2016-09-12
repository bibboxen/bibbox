/**
 * @file
 * Defines an event bus to send messages between plugins.
 */

// Get event emitter from node core.
var EventEmitter = require('events').EventEmitter;

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  // Create the event bus.
  var emitter = new EventEmitter();

  register(null, {
    'bus': {
      emit: emitter.emit,
      on: emitter.on,
      once: emitter.once
    }
  });
};
