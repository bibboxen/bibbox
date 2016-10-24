/**
 * @file
 * The barcode reader plugin.
 */

'use strict';

var util = require('util');
var eventEmitter = require('events').EventEmitter;
var usb = require('usb');

var Barcode = function Barcode(VID, PID) {
  this.VID = VID;
  this.PID = PID;

  this.code = [];

  this.connected = false;
  this.emitCode = false;
};

// Extend the object with event emitter.
util.inherits(Barcode, eventEmitter);

/**
 * Connect to barcode reader.
 *
 * Connects to the barcode reader.
 * Then starts to listen for data from barcode reader,
 * and when the "\n" key is received, emits the code event,
 * containing the data received.
 */
Barcode.prototype.connect = function connect() {
  var self = this;

  try {
    // Get the device.
    var term = usb.findByIds(self.VID, self.PID);
    term.open();

    // Open the interface an connect.
    var iface = term.interfaces.shift();
    iface.claim();

    // Get end-point an start data event.
    var inEndpoint = iface.endpoints[0];
    inEndpoint.startPoll();

    // Register listener for data events.
    inEndpoint.on('data', function (data) {
      if (self.emitCode) {
        var key = self.parseBuffer(data);
        if (key !== "\n") {
          if (key !== -1) {
            self.code.push(key);
          }
        }
        else {
          // Emit the code that was read.
          self.emit('code', self.code.join(''));
          self.code = [];
        }
      }
    });

    inEndpoint.on('error', function (err) {
      self.emit('err', err);
    });

    self.connected = true;
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
 * List devices.
 *
 * @returns {*}
 */
Barcode.prototype.list = function list() {
  return usb.getDeviceList();
};

/**
 * Start emitting scanned codes.
 */
Barcode.prototype.start = function start() {
  if (!this.connected) {
    this.connect();
  }
  this.emitCode = true;
};

/**
 * Stop emitting scanned codes.
 */
Barcode.prototype.stop = function stop() {
  this.emitCode = false;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;

  /**
   * @TODO: make the VID and PID configurable.
   */
  var barcode = new Barcode(options.vid, options.pid);
  barcode.connect();

  /**
   * Listen to list devices event.
   */
  bus.on('barcode.list', function (data) {
    bus.emit(data.busEvent, barcode.list());
  });

  /**
   * Listen to barcode start event.
   */
  bus.on('barcode.start', function () {
    bus.emit('logger.debug', 'Barcode: started');
    barcode.start();
  });

  /**
   * Listen to barcode stop event.
   */
  bus.on('barcode.stop', function () {
    bus.emit('logger.debug', 'Barcode: stopped');
    barcode.stop();
  });

  /**
   * Listen to barcode read and emit the code into the bus.
   */
  barcode.on('code', function (code) {
    bus.emit('logger.debug', 'Barcode: scanned - ' + code);
    bus.emit('barcode.data', code);
  });

  /**
   * Listen to barcode errors and emit the error into the bus.
   *
   * @NOTE: Its call err an not error, because nodeJS catches "error" events.
   */
  barcode.on('err', function (err) {
    bus.emit('logger.err', 'Barcode: ' + err);
    bus.emit('barcode.err', {
      msg: err.message
    });
  });

  register(null, {
    barcode: barcode
  });
};
