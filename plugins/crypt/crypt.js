/**
 * @file
 * Handles communication with the application and provides config.
 */
'use strict';

var crypto = require('crypto');
var uniqid = require('uniqid');

/**
 * Default constructor.
 *
 * @param bus
 *
 * @constructor
 */
var Crypt = function Crypt(bus) {
  this.config = {
    "public": "",
    "url": ""
  }

  // Load configuration.
  var busEvent = 'crypt.config.loaded' + uniqid();
  var errorEvent = 'crypt.config.error' + uniqid();

  var self = this;
  bus.once(busEvent, function (config) {
    if (config.hasOwnProperty('keys')) {
      self.config['public'] = config.keys.public;
      self.config['url'] = config.keys.url;
    }
  });

  bus.emit('ctrl.config.config', {
    busEvent: busEvent,
    errorEvent: errorEvent
  });

};

/**
 * Helper function to get private decrypt key.
 *
 * @return {string}
 *  The decrypt key.
 */
Crypt.prototype.getPrivateKey = function getPrivateKey() {
  const request = require('sync-request');
  const res = request('GET', this.config.url);

  return res.getBody().toString();
}

/**
 * Encrypt text with the configured public key.
 *
 * @param text
 *   Text to encrypt.
 *
 * @return {string}
 *   Encrypted text.
 */
Crypt.prototype.encrypt = function encrypt(text) {
  var self = this;
  return crypto.publicEncrypt({
      key: self.config.public,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(text.toString())
  ).toString('base64');
};

/**
 * Decrypt text with download key.
 *
 * @param encryptedText
 *   The encrypted text.
 *
 * @return {string}
 *   Decrypted text.
 */
Crypt.prototype.decrypt = function decrypt(encryptedText) {
  var key = this.getPrivateKey();
  return crypto.privateDecrypt(
    {
      key: key,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(encryptedText, 'base64')
  ).toString();
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
  var crypt = new Crypt(imports.bus);

  register(null, {
    crypt: crypt
  });
};
