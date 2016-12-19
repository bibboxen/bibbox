/**
 * @file
 * Translations plugin.
 *
 * Enables the front-end (AngularJS) to have dynamic language translations.
 */

'use strict';

var i18n = require('i18n');
var fs = require('fs');

/**
 * This object encapsulates translation.
 *
 * @param {object} bus
 *   The event bus.
 * @param {object} paths
 *   JSON object with information about the translations files to use.
 * @param {array} languages
 *   The supported languages.
 */
var Translation = function (bus, paths, languages) {
  var self = this;

  // Configure I18N with supported languages.
  var directory = __dirname + '/../../' + paths.base + '/' + paths.translations + '/ui';
  i18n.configure({
    locales: languages.locales,
    defaultLocale: languages.defaultLocale,
    indent: '  ',
    autoReload: true,
    directory: directory
  });

  // Watch for changes in the translations files and send them in next tick to
  // give n18l an change to reload..
  // @TODO: Avoid more than one push when multiple language files are changed.
  fs.watch(directory, function (event, filename) {
    process.nextTick(function () {
      var langCode = filename.split('.json')[0];
      var translations = {};
      translations[langCode] = self.getTranslationsLang(langCode);

      bus.emit('config.ui.translations.update', {
        translations: translations
      });
    });
  });
};

/**
 * Get all translations.
 *
 * @return {*}
 *   JSON object with the translations.
 */
Translation.prototype.getTranslations = function getTranslations() {
  return i18n.getCatalog();
};

/**
 * Get translations for a given language.
 *
 * @param {string} lang
 *   Language code.
 *
 * @return {*}
 *   JSON object with the translations.
 */
Translation.prototype.getTranslationsLang = function getTranslationsLang(lang) {
  return i18n.getCatalog(lang);
};

/**
 * Register the plugin with architect.
 *
 * @param {array} options
 *   Options defined in app.js.
 * @param {array} imports
 *   The other plugins available.
 * @param {function} register
 *   Callback function used to register this plugin.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;
  var translation = new Translation(bus, options.paths, options.languages);

  /**
   * Handler for 'translations.request' event.
   *
   * Gets all translations in all languages.
   */
  bus.on('translations.request', function requestTranslations(data) {
    bus.emit(data.busEvent, translation.getTranslations());
  });

  /**
   * Handler for 'translations.request.lang' event.
   *
   * Gets translations for the language given.
   */
  bus.on('translations.request.lang', function requestTranslations(data) {
    bus.emit(data.busEvent, translation.getTranslationsLang(data.lang));
  });

  register(null, {
    translation: translation
  });
};
