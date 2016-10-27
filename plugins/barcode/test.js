/**
 * @file
 * Helper to setup usb barcode on new machines.
 */

var bus = null;
var b = require('./../bus/bus.js');
b({}, {}, function (a ,r) {
  bus = r.bus;
});

var barcode = null;
var b = require('./barcode.js');
b({}, {'bus': bus }, function (a ,r) {
  barcode = r.barcode;
});

var stop = false;
bus.on('code', function (data) {
  console.log(data);
  stop = true;
});
barcode.start();

process.on('SIGINT', function() {
  stop = true;
});

(function wait () {
  if (!stop) setTimeout(wait, 100);
})();
