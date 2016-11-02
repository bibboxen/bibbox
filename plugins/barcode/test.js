/**
 * @file
 * Helper to setup usb barcode on new machines.
 */

var config = require('./../../config.json');

var bus = null;
var b = require('./../bus/bus.js');
b({}, {}, function (a ,r) {
  bus = r.bus;
});

var barcode = null;
var b = require('./barcode.js');
b({ vid: config.barcode.vid, pid: config.barcode.pid}, {bus: bus }, function (a ,r) {
  barcode = r.barcode;
  //console.log(barcode.list());
});

var stop = false;
bus.on('code', function (data) {
  console.log('Barcode: ' + data);
  stop = true;
});
barcode.start();

barcode.on('err', function (err) {
  console.log(err);
});

process.on('SIGINT', function() {
  stop = true;
});

(function wait () {
  if (!stop) setTimeout(wait, 100);
})();
