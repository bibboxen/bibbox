/**
 * @file
 * API
 */

/**
 * This object encapsulates the API.
 *
 * @param app
 * @param options
 * @param bus
 *
 * @constructor
 */
var API = function (app, options, bus) {
  "use strict";

  var self = this;

  /**
   * Default get request.
   */
  app.get('/api', function (req, res) {
    res.status(501).send('Please see documentation about using this api.');
  });

  /**
   *
   */
  app.get('/api/barcode', function getBarcode(req, res) {
    bus.once('barcode.data', function barcodeData(data) {
      console.log(data);
      bus.emit('barcode.stop');
      res.status(200).send(data);
    });

    bus.emit('barcode.start');
  });
};


/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Create the API routes using the API object.
  var api = new API(imports.app, options, imports.bus);

  // This plugin extends the server plugin and do not provide new services.
  register(null, {
    "api": api
  });
};
