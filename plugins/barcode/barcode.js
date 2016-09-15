/**
 * @file
 * The barcode reader plugin.
 */

// Node core modules required.
var util = require('util');
var eventEmitter = require('events').EventEmitter;

var Barcode = function Barcode(VID, PID) {
  "use strict";

  this.VID = VID;
  this.PID = PID;

  this.code = [];

  this.device = undefined;
};

// Extend the object with event emitter.
util.inherits(Barcode, eventEmitter);

/**
 * Connect to barcode reader.
 */
Barcode.prototype.connect = function connect() {
  var self = this;

  var HID = require('node-hid');
  try {
    self.device = new HID.HID(self.VID, self.PID);
    self.pause();

    self.device.on('data', function(data) {
      var key = self.parseBuffer(data);
      if (key !== "\n") {
        if (key !== -1) {
          self.code.push(key);
        }
      }
      else {
        self.emit('code', self.code.join(''));
      }
    });
  }
  catch (err) {
    self.emit('err', err);
  }
};

/**
 * Parse buffer from barcode reader.
 *
 * @param data
 *   The raw buffer from the reader.
 *
 * @returns {*}
 *   The buffers numeric value. If no value -1 and "\n" at end-of-number.
 */
Barcode.prototype.parseBuffer = function parseBuffer(data) {
  var keyCode;

  data = data.toJSON();

  switch (data.data[2]) {
    case 30:
      keyCode = 1;
      break;

    case 31:
      keyCode = 2;
      break;

    case 32:
      keyCode = 3;
      break;

    case 33:
      keyCode = 4;
      break;

    case 34:
      keyCode = 5;
      break;

    case 35:
      keyCode = 6;
      break;

    case 36:
      keyCode = 7;
      break;

    case 37:
      keyCode = 8;
      break;

    case 38:
      keyCode = 9;
      break;

    case 39:
      keyCode = 0;
      break;

    case 40:
      keyCode = "\n";
      break;

    default:
      keyCode = -1;
      break;
  }

  return keyCode;
};

/**
 *
 * @returns {*}
 */
Barcode.prototype.list = function list() {
  return HID.devices();
};

/**
 *
 */
Barcode.prototype.resume = function resume() {
  if (this.device !== undefined) {
    this.device.resume();
  }
  else {
    this.emit('err', new Error('No barcode devices available.', -1));
  }
};

/**
 *
 */
Barcode.prototype.pause = function pause() {
  if (this.device !== undefined) {
    this.device.pause();
  }
  else {
    this.emit('err', new Error('No barcode devices available.', -1));
  }
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
	var bus = imports.bus;

  /**
   * @TODO: make the VID and PID configurable.
   */
  var barcode = new Barcode(1529, 8710);
  barcode.connect();

  /**
   * Listen to list devices event.
   */
  bus.on('barcode.list', function(callback) {
    bus.emit(callback, barcode.list());
  });

  /**
   * Listen to barcode start event.
   */
  bus.on('barcode.start', function() {
    bus.emit('logger.debug', 'Barcode: started');
    barcode.resume();
  });

  /**
   * Listen to barcode stop event.
   */
  bus.on('barcode.stop', function() {
    bus.emit('logger.debug', 'Barcode: stopped');
    barcode.pause();
  });

  /**
   * Listen to barcode read and emit the code into the bus.
   */
  barcode.on('code', function(code) {
    bus.emit('logger.debug', 'Barcode: scanned - ' + code);
    bus.emit('barcode.data', code);
  });

  /**
   * Listen to barcode errors and emit the error into the bus.
   *
   * @NOTE: Its call err an not error, because nodeJS catches "error" events.
   */
  barcode.on('err', function(err) {
    bus.emit('logger.err', 'Barcode: ' + err);
    bus.emit('barcode.err', err);
  });

  register(null, {
    "barcode" : barcode
  });
};
