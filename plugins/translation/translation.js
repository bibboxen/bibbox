/**
 * @file
 * Translations plugin.
 *
 * Enables the front-end (AngularJS) to have dynamic language translations.
 */

var jsonfile = require('jsonfile');

/**
 * This object encapsulates translation.
 *
 * @param bus
 * @param destination
 *
 * @constructor
 */
var Translation = function (bus, destination) {
  "use strict";

  /**
   * Handler for 'config.translations.request' event.
   *
   * Reads translations from disc.
   */
  bus.on('config.translations.request', function requestTranslations(data) {
    jsonfile.readFile(__dirname + destination, function (err, obj) {
      if (err) {
        bus.emit('logger.error', err);
        bus.emit(data.busEvent, {});
      }
      else {
        bus.emit(data.busEvent, obj);
      }
    });
  });

  /**
   * Handler for 'config.translations.update' event.
   *
   * Writes new translations to disc and emits the changes to the bus.
   */
  bus.on('config.translations.update', function updateTranslations(data) {
    // Require that at least en and da translations are available.
    if (!data.translations || !data.translations.hasOwnProperty('da') || !data.translations.hasOwnProperty('en')) {
      bus.emit('logger.err', 'config.translations.update: Translations (da and en) not set.');
      return;
    }

    // Write the translations to disc.
    jsonfile.writeFile(__dirname + destination, data.translations, function(err) {
      if (err) {
        bus.emit('logger.err', err);
      }
      else {
        bus.emit('logger.debug', 'Translations read successfully from ' + __dirname + destination);
      }
    });

    // Emit the updated translations.
    bus.emit('config.translations.request', {"translations": data.translations, "busEvent": data.busEvent});
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  "use strict";

  var translation = new Translation(imports.bus, options.destination);

  register(null, {
    "translation": translation
  });
};
