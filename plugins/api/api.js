/**
 * @file
 * API
 */

'use strict';

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
  // Default get request.
  app.get('/api', function (req, res) {
    res.status(501).send('Please see documentation about using this api.');
  });

  // Configuration requests.
  app.post('/api/config', function (req, res) {
    console.log(req.body);

    bus.once('storage.config.saved', function (status) {
      console.log('yeah');
    });
    bus.emit('storage.save', {
      type: 'config',
      name: 'ui',
      obj: req.body.ui,
      busEvent: 'storage.config.saved'
    });
    bus.emit('storage.save', {
      type: 'config',
      name: 'fbs',
      obj: req.body.fbs,
      busEvent: 'storage.config.saved'
    });
    bus.emit('storage.save', {
      type: 'config',
      name: 'notification',
      obj: req.body.notification,
      busEvent: 'storage.config.saved'
    });

    res.status(200).send('Config!');
  });

  // Translations requests.
  app.post('/api/translations', function (req, res) {
    console.log(req.body);
    res.status(200).send('Translations!');
  });

  // Restart UI requests.
  app.post('/api/restart_ui', function (req, res) {
    console.log(req.body);
    res.status(200).send('Restart UI!');
  });

  // Restart node requests.
  app.post('/api/restart_node', function (req, res) {
    console.log(req.body);
    res.status(200).send('Restart Node!');
  });
};


/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  // Create the API routes using the API object.
  var api = new API(imports.app, options, imports.bus);

  // This plugin extends the server plugin and do not provide new services.
  register(null, {
    api: api
  });
};
