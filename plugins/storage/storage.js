/**
 * @file
 * Storage plugin.
 *
 * @NOTES: Different stores config, translations and off-line.
 */

'use strict';

var jsonfile = require('jsonfile');
var fs = require('fs');
var lockfile = require('proper-lockfile');
var Q = require('q');

var Storage = function Storage(bus, paths) {
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
 * Load object from storage.
 *
 * @param type
 *   The type (config, translation or offline).
 * @param name
 *   Name of the modules config.
 * @returns {*}
 *   JSON object with the config.
 */
Storage.prototype.load = function load(type, name) {
  var deferred = Q.defer();

  var file = this.path + type + '/' + name + '.json';
  lockfile.lock(file, { retries: this.retries}, function (err) {
    if (err) {
      deferred.reject(err);
    }

    try {
      var data = jsonfile.readFileSync(file);
      deferred.resolve(data);
    }
    catch (err) {
      deferred.reject(err);
    }

    // Release the lock.
    lockfile.unlock(file);
  });

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
  var deferred = Q.defer();

  var file = this.path + type + '/' + name + '.json';
  lockfile.lock(file, { retries: this.retries}, function (err) {
    if (err) {
      deferred.reject(err);
    }

    try {
      var res = jsonfile.writeFileSync(file, obj, {
        spaces: 2
      });
      deferred.resolve(res);
    }
    catch (err) {
      deferred.reject(err);
    }

    // Release the lock.
    lockfile.unlock(file);
  });

  return deferred.promise;
};

/**
 * Append data into storage.
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
Storage.prototype.append = function append(type, name, obj) {
  var deferred = Q.defer();

  var file = this.path + type + '/' + name + '.json';
  lockfile.lock(file, { retries: this.retries}, function (err) {
    if (err) {
      deferred.reject(err);
    }

    var data;
    try {
      data = jsonfile.readFileSync(file);
      data.push(obj);
    }
    catch (err) {
      if (err.code === 'ENOENT') {
        // File don't exists. Set data to the parsed in object.
        data = [ obj ];
      }
      else {
        deferred.reject(err);
      }
    }

    try {
      var res = jsonfile.writeFileSync(file, data, {
        spaces: 2
      });
      deferred.resolve(res);
    }
    catch (err) {
      deferred.reject(err);
    }

    // Release the lock.
    lockfile.unlock(file);
  });

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
  var deferred = Q.defer();

  var file = this.path + type + '/' + name + '.json';
  lockfile.lock(file, { retries: this.retries}, function (err) {
    if (err) {
      deferred.reject(err);
    }

    try {
      fs.unlinkSync(file);
      deferred.resolve();
    }
    catch (err) {
      deferred.reject(err);
    }

    // Release the lock.
    lockfile.unlock(file);
  });

  return deferred.promise;
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var bus = imports.bus;
  var storage = new Storage(bus, options.paths);

  /**
   * Listen to load requests.
   */
  bus.on('storage.load', function (data) {
    storage.load(data.type, data.name).then(function (res) {
      bus.emit(data.busEvent, res);
    },
    function (err) {
      bus.emit(data.busEvent, err);
      bus.emit('logger.err', err.message);
    });
  });

  /**
   * Listen to save requests.
   */
  bus.on('storage.save', function (data) {
    storage.save(data.type, data.name, data.obj).then(function (res) {
      bus.emit(data.busEvent, res);
    },
    function (err) {
      bus.emit(data.busEvent, err);
      bus.emit('logger.err', err.message);
    });
  });

  /**
   * Listen to append requests.
   */
  bus.on('storage.append', function (data) {
    storage.append(data.type, data.name, data.obj).then(function (res) {
      bus.emit(data.busEvent, true);
    },
    function(err) {
      bus.emit(data.busEvent, err);
      bus.emit('logger.err', err.message);
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
      bus.emit(data.busEvent, err);
      bus.emit('logger.err', err.message);
    });
  });

  register(null, {
    storage: storage
  });
};
