/**
 * @file
 * Handles communication with the application and provides config.
 */
'use strict';

var crypto = require('crypto');
var fs = require('fs');
var uniqid = require('uniqid');

var Crypt = function Crypt(bus) {
  this.config = {
    "public": ''
  }

  // Load configuration.
  var busEvent = 'crypt.config.loaded' + uniqid();
  var errorEvent = 'crypt.config.error' + uniqid();

  var self = this;
  bus.once(busEvent, function (config) {
    if (config.hasOwnProperty('keys')) {
      self.config['public'] = config.keys.public;
      console.log(self.config);
    }
  });

  bus.emit('ctrl.config.config', {
    busEvent: busEvent,
    errorEvent: errorEvent
  });

};

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

Crypt.prototype.decrypt = function decrypt(encryptedText, key) {
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
