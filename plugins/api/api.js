/**
 * @file
 * Added API to send content into the search engine
 */

/**
 * This object encapsulate the RESET API.
 *
 * @param app
 * @param options
 *
 * @constructor
 */
var API = function (app, options) {
  "use strict";

  var self = this;

  /**
   * Default get request.
   */
  app.get('/api', function (req, res) {
    res.status(501).send('Please see documentation about using this api.');
  });
};


/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  // Create the API routes using the API object.
  var api = new API(imports.app, options);

  // This plugin extends the server plugin and do not provide new services.
  register(null, {
    "api": api
  });
};
