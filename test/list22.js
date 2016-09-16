
var usb = require('usb');
var term = usb.findByIds(1529, 8710);

term.open();
var iface = term.interfaces[0];
iface.claim();

var endpoints = iface.endpoints;
var inEndpoint = endpoints[0];

inEndpoint.on('data', function (data) {
  console.log(data);
});
inEndpoint.on('error', function (error) {
  console.log(error);
});
