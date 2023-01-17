/**
 * @file
 * Handles communication with the application and provides config.
 */
'use strict';

var crypto = require('crypto');
var fs = require('fs');

var Crypt = function Crypt() {
  // @TODO: Add keys from configuration.
};

Crypt.prototype.encrypt = function encrypt(text) {
  return crypto.publicEncrypt({
      key: fs.readFileSync(__dirname + '/pub.pem', 'utf8'),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(text.toString())
  ).toString('base64');
};

Crypt.prototype.decrypt = function decrypt(encryptedText) {
  return crypto.privateDecrypt(
    {
      key: fs.readFileSync(__dirname + '/priv.pem', 'utf8'),
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
  var crypt = new Crypt();

  register(null, {
    crypt: crypt
  });
};
