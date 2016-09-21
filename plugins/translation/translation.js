/**
 * @file
 * Translation
 */

var fs = require('fs');

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
   * Handler for 'config.translations' event.
   *
   * Reads translations from disc.
   */
  bus.on('config.translations.request', function requestTranslations(data) {
    fs.readFile(__dirname + destination, 'utf-8', function (err, source) {
      if (err) {
        bus.emit('logger.error', err);
        bus.emit(data.busEvent, {});
      }
      else {
        var translations = JSON.parse(source);
        bus.emit(data.busEvent, translations);
      }
    });
  });

  /**
   * Handler for 'config.translations.update' event.
   *
   * Writes new translations to disc and emits the changes to the bus.
   */
  bus.on('config.translations.update', function updateTranslations(data) {
    if (!data.translations || !data.translations.hasOwnProperty('da') || !data.translations.hasOwnProperty('en')) {
      bus.emit('logger.error', 'config.translations.update: Translations (da and en) not set.');
      return;
    }

    // Write the translations to disc.
    fs.writeFile(__dirname + destination, JSON.stringify(data.translations), function (err) {
      if (err) {
        return console.error(err);
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
