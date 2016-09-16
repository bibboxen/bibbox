/**
 * @file
 * Unit test setup of barcode plugin.
 */

/**
 * Setup the application plugin for barcode tests.
 */
var setup = function setup() {
  var path = require('path');

	// Load config file.
	var config = require(__dirname + '/../config.json');

	// Configure the plugins.
	var plugins = [
	  {
	    "packagePath": "./../plugins/logger",
	    "logs": config.logs
	  },
	  {
	    "packagePath": "./../plugins/bus"
	  },
	  {
	    "packagePath": "./../plugins/barcode"
	  }
	];

	return setupArchitect(plugins, config);
};

it('Parser', function() {
  return setup().then(function (app) {
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 30, 0, 0 ,0 ,0])).should.be.exactly(1).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 31, 0, 0 ,0 ,0])).should.be.exactly(2).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 32, 0, 0 ,0 ,0])).should.be.exactly(3).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 33, 0, 0 ,0 ,0])).should.be.exactly(4).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 34, 0, 0 ,0 ,0])).should.be.exactly(5).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 35, 0, 0 ,0 ,0])).should.be.exactly(6).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 36, 0, 0 ,0 ,0])).should.be.exactly(7).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 37, 0, 0 ,0 ,0])).should.be.exactly(8).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 38, 0, 0 ,0 ,0])).should.be.exactly(9).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 39, 0, 0 ,0 ,0])).should.be.exactly(0).and.be.a.Number();
    app.services.barcode.parseBuffer(Buffer.from([0, 0, 40, 0, 0 ,0 ,0])).should.be.exactly("\n");
  });
});

it('List devices', function() {
	return setup().then(function (app) {
		var list = app.services.barcode.list();
		list.length.should.be.above(0);
	});
});