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
  bus.on('config.translations', function (callback) {
    fs.readFile(__dirname + destination, 'utf-8', function (err, source) {
      if (err) {
        bus.emit('logger.error', err);
        bus.emit(callback, {});
      }
      else {
        var translations = JSON.parse(source);
        bus.emit(callback, translations);
      }
    });
  });

  /**
   * Handler for 'config.translations.update' event.
   *
   * Writes new translations to disc and emits the changes to the bus.
   */
  bus.on('config.translations.update', function updateTranslations(translations) {
    if (!translations || !translations.hasOwnProperty('da') || !translations.hasOwnProperty('en')) {
      bus.emit('logger.error', 'config.translations.update: Translations (da and en) not set.');
      return;
    }

    // Write the translations to disc.
    fs.writeFile(__dirname + destination, JSON.stringify(translations),  function(err) {
      if (err) {
        return console.error(err);
      }
    });

    // Emit the updated translations.
    bus.emit('config.translations', translations);
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
