/**
 * @file
 * Translations plugin.
 *
 * Enables the front-end (AngularJS) to have dynamic language translations.
 */
var i18n = require('i18n');

/**
 * This object encapsulates translation.
 */
var Translation = function (bus) {
  "use strict";

  // Configure I18N with supported languages.
  i18n.configure({
    locales:['en', 'da'],
    defaultLocale: 'en',
    indent: "  ",
    autoReload: true,
    directory: __dirname + '/../../locales/ui'
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
 * Update the translations store on disk.
 *
 * @TODO: Update translations based on input from admin.
 * @TODO: Update the json files. The i18n will automatically pickup the
 *        changes.
 * @TODO: trigger the translations update in proxy.js
 */
Translation.prototype.updateTranslations = function updateTranslations() {

};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  'use strict';

  var bus = imports.bus;
  var translation = new Translation(bus);

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

  /**
   * Handler for 'config.translations.update' event.
   *
   * Writes new translations to disc and emits the changes to the bus.
   */
  bus.on('translations.update', function updateTranslations(data) {
    translation.updateTranslations();
  });

  register(null, {
    "translation": translation
  });
};
