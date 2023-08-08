/**
 * @file
 * Storage plugin.
 *
 * @NOTES: Different stores config, translations and off-line.
 */

'use strict';

const jsonfile = require('jsonfile');
const fs = require('fs');
const lockfile = require('proper-lockfile');
const Q = require('q');

const Storage = function Storage(bus, paths) {
  this.path = __dirname + '/../../' + paths.base + '/';

  this.retries = {
    retries: 5,
    factor: 3,
    minTimeout: 500,
    maxTimeout: 1000,
    randomize: true
  };
};

/**
 * Lock storage.
 *
 * @param type
 *   The type (config, translation or offline).
 * @param name
 *   Name of the modules config.
 *
 * @returns {*|promise}
 */
Storage.prototype.lock = function lock(type, name) {
  let deferred = Q.defer();

  let file = this.path + type + '/' + name + '.json';
  lockfile.lock(file, { retries: this.retries }, function (err) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(file);
    }
  });

  return deferred.promise;
};

/**
 * Un-lock file.
 *
 * @param file
 *   The name of the file returned by the lock function.
 */
Storage.prototype.unlock = function unlock(file) {
  lockfile.unlockSync(file);
};

/**
 * Check if storage is locked.
 *
 * @param type
 *   The type (config, translation or offline).
 * @param name
 *   Name of the modules config.
 *
 * @returns {*|promise}
 */
Storage.prototype.isLocked = function isLocked(type, name) {
  let deferred = Q.defer();

  let file = this.path + type + '/' + name + '.json';
  lockfile.check(file, function (err, isLocked) {
    if (err) {
      deferred.reject(err);
    }
    else {
      deferred.resolve(isLocked);
    }
  });

  return deferred.promise;
};

/**
 * Load object from storage.
 *
 * @param type
 *   The type (config, translation or offline).
 * @param name
 *   Name of the module's config.
 * @returns {*}
 *   JSON object with the config.
 */
Storage.prototype.load = function load(type, name) {
  let deferred = Q.defer();

  let file = this.path + type + '/' + name + '.json';
  try {
    let data = jsonfile.readFileSync(file);
    deferred.resolve(data);
  }
  catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
};

/**
 * Save object from storage.
 *
 * @param type
 *   The type (config, translation or offline).
 * @param name
 *   Name of the modules config.
 * @param obj
 *   Data to store.
 *
 * @returns {*}
 */
Storage.prototype.save = function save(type, name, obj) {
  let deferred = Q.defer();

  let file = this.path + type + '/' + name + '.json';
  try {
    var res = jsonfile.writeFileSync(file, obj, {
      spaces: 2
    });

    deferred.resolve(res);
  }
  catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
};

/**
 * Remove data from the storage.
 *
 * @param type
 *   The type (config, translation or offline).
 * @param name
 *   Name of the modules config.
 *
 * @returns {*}
 */
Storage.prototype.remove = function append(type, name) {
  let deferred = Q.defer();

  let file = this.path + type + '/' + name + '.json';
  try {
    fs.unlinkSync(file);
    deferred.resolve();
  }
  catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
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
  const bus = imports.bus;
  const storage = new Storage(bus, options.paths);

  /**
   * Listen to load requests.
   */
  bus.on('storage.load', function (data) {
    storage.load(data.type, data.name).then(function (res) {
      bus.emit(data.busEvent, res);
    },
    function (err) {
      bus.emit(data.errorEvent, err);
      console.error('Storage', err.message);
    });
  });

  /**
   * Listen to save requests.
   */
  bus.on('storage.save', function (data) {
    storage.save(data.type, data.name, data.obj).then(function (res) {
      bus.emit(data.busEvent, res);
      bus.emit('storage.saved', { 'name': data.name });
    },
    function (err) {
      bus.emit(data.errorEvent, err);
      console.error('Storage', err.message);
    });
  });

  /**
   * Listen to remove requests.
   */
  bus.on('storage.remove', function (data) {
    storage.remove(data.type, data.name).then(function () {
      bus.emit(data.busEvent, true);
    },
    function (err) {
      bus.emit(data.errorEvent, err);
      console.error('Storage', err.message);
    });
  });

  register(null, {
    storage: storage
  });
};
