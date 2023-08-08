/**
 * @file
 * Helper to setup usb barcode on new machines.
 */
'use strict';

const config = require('./../../config.json');

let bus = null;
let b = require('./../bus/bus.js');
b({}, {}, function (a, r) {
  bus = r.bus;
});

let barcode = null;
b = require('./barcode.js');
b({ vid: config.barcode.vid, pid: config.barcode.pid }, { bus: bus }, function (a, r) {
  barcode = r.barcode;
});

barcode.on('err', function (err) {
  console.log(err);
});

let stop = false;
barcode.on('code', function (data) {
  console.log('Barcode: ' + data);
  stop = true;
});
barcode.start();

process.on('SIGINT', function () {
  stop = true;
});

(function wait () {
  if (!stop) {
    setTimeout(wait, 100);
  }
})();
