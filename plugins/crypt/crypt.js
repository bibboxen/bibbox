/**
 * @file
 * Handles communication with the application and provides config.
 */
'use strict';

const fs = require('fs');
const crypto = require('crypto');
const uniqid = require('uniqid');
const debug = require('debug')('bibbox:crypt');

/**
 * Default constructor.
 *
 * @param bus
 *
 * @constructor
 */
const Crypt = function Crypt(bus) {
  this.config = {
    'public': '',
    'private': false,
    'url': ''
  };

  this.debug_certs = process.env.CERTS_DEBUG || false;
  debug('Local certificates requested loaded from: ' + this.debug_certs);

  // Load configuration.
  let busEvent = 'crypt.config.loaded' + uniqid();
  let errorEvent = 'crypt.config.error' + uniqid();

  let self = this;
  bus.once(busEvent, function (config) {
    if (config.hasOwnProperty('keys')) {
      self.config['public'] = config.keys.public;
      self.config['url'] = config.keys.url;

      if (false !== self.debug_certs) {
        debug('Load public key form local: ' + self.debug_certs + '/public.pem');
        self.config['public'] = fs.readFileSync(self.debug_certs + '/public.pem', {encoding: 'utf8', flag: 'r'});
        debug('Load private key form local: ' + self.debug_certs + '/private.pem');
        self.config['private'] = fs.readFileSync(self.debug_certs + '/private.pem', {encoding: 'utf8', flag: 'r'});
      }

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
  // If in debug mode, return local private certificate.
  if (false !== this.config['private']) {
    return this.config.private;
  }

  const request = require('sync-request');
  const res = request('GET', this.config.url);

  if (res.statusCode !== 200) {
    debug(res);
  }

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
  let self = this;
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
  let key = this.getPrivateKey();
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
  const crypt = new Crypt(imports.bus);

  register(null, {
    crypt: crypt
  });
};
