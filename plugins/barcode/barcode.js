/**
 * @file
 * The barcode reader plugin.
 */

'use strict';

const util = require('util');
const eventEmitter = require('events').EventEmitter;
const usb = require('usb');

/**
 * Barcode object.
 *
 * @param {string} VID
 *   USB vendor ID.
 * @param {string} PID
 *   USB product id.
 *
 * @constructor
 */
const Barcode = function Barcode(VID, PID) {
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
  let self = this;

  try {
    // Get the device.
    let term = usb.findByIds(self.VID, self.PID);
    term.open();

    // Open the interface an connect.
    let iface = term.interfaces.shift();
    if (iface.isKernelDriverActive()) {
      iface.detachKernelDriver();
    }
    iface.claim();

    // Get end-point an start data event.
    let inEndpoint = iface.endpoints[0];
    inEndpoint.startPoll();

    // Register listener for data events.
    inEndpoint.on('data', function (data) {
      if (self.emitCode) {
        let key = self.parseBuffer(data);
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
 * @param {buffer} data
 *   The raw buffer from the reader.
 *
 * @return {*}
 *   The buffers numeric value. If no value -1 and "\n" at end-of-number.
 */
Barcode.prototype.parseBuffer = function parseBuffer(data) {
  let keyCode;

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
 * @return {*}
 *   List of available USB devices.
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
 *
 * @param {array} options
 *   Options defined in app.js.
 * @param {array} imports
 *   The other plugins available.
 * @param {function} register
 *   Callback function used to register this plugin.
 */
module.exports = function (options, imports, register) {
  const bus = imports.bus;

  /**
   * @TODO: make the VID and PID configurable.
   */
  const barcode = new Barcode(options.vid, options.pid);
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
    bus.emit('logger.debug', { 'type': 'barcode', 'message': 'Started' });
    barcode.start();
  });

  /**
   * Listen to barcode stop event.
   */
  bus.on('barcode.stop', function () {
    bus.emit('logger.debug', { 'type': 'barcode', 'message': 'Stopped' });
    barcode.stop();
  });

  /**
   * Listen to barcode read and emit the code into the bus.
   */
  barcode.on('code', function (code) {
    bus.emit('logger.debug', { 'type': 'barcode', 'message': 'Scanned - ' + code });
    bus.emit('barcode.data', {
      timestamp: new Date().getTime(),
      code: code
    });
  });

  /**
   * Listen to barcode errors and emit the error into the bus.
   *
   * @NOTE: Its call err an not error, because nodeJS catches "error" events.
   */
  barcode.on('err', function (err) {
    bus.emit('logger.err', { 'type': 'barcode', 'message': err.toString() });
    bus.emit('barcode.err', {
      timestamp: new Date().getTime(),
      msg: err.message
    });
  });

  register(null, {
    barcode: barcode
  });
};
