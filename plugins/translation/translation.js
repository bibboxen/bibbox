/**
 * @file
 * Translations plugin.
 *
 * Enables the front-end (AngularJS) to have dynamic language translations.
 */

'use strict';

var i18n = require('i18n');

/**
 * This object encapsulates translation.
 */
var Translation = function (bus, paths, languages) {
  // Configure I18N with supported languages.
  i18n.configure({
    locales: languages.locales,
    defaultLocale: languages.defaultLocale,
    indent: '  ',
    autoReload: true,
    directory: __dirname + '/../../' + paths.base + '/' + paths.translations + '/ui'
  });
};

/**
 * Get all translations.
 *
 * @returns {*}
 *   JSON object with the translations.
 */
Translation.prototype.getTranslations = function getTranslations() {
  return i18n.getCatalog();
};

/**
 * Get translations for a given language.
 *
 * @param lang
 *   Language code.
 *
 * @returns {*}
 *   JSON object with the translations.
 */
Translation.prototype.getTranslationsLang = function getTranslationsLang(lang) {
  return i18n.getCatalog(lang);
};

/**
 * Register the plugin with architect.
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
