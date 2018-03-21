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
  var deferred = Q.defer();

  var file = this.path + type + '/' + name + '.json';
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
  var deferred = Q.defer();

  var file = this.path + type + '/' + name + '.json';
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
 *   Name of the modules config.
 * @returns {*}
 *   JSON object with the config.
 */
Storage.prototype.load = function load(type, name) {
  var deferred = Q.defer();

  var file = this.path + type + '/' + name + '.json';
  try {
    var data = jsonfile.readFileSync(file);
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
  var deferred = Q.defer();

  var file = this.path + type + '/' + name + '.json';
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
      return deferred.promise;
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
      bus.emit(data.errorEvent, err);
      bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
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
      bus.emit(data.errorEvent, err);
      bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
    });
  });

  /**
   * Listen to append requests.
   */
  bus.on('storage.append', function (data) {
    if (data.hasOwnProperty('lockFile') && data.lockFile === true) {
      storage.lock(data.type, data.name).then(function (file) {
        storage.append(data.type, data.name, data.obj).then(function (res) {
          storage.unlock(file);
          bus.emit(data.busEvent, true);
        },
        function (err) {
          storage.unlock(file);
          bus.emit(data.errorEvent, err);
          bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
        });
      },
      function (err) {
        if (err.code === 'ENOENT') {
          // Could not lock file as it don't exists.
          storage.append(data.type, data.name, data.obj).then(function (res) {
            bus.emit(data.busEvent, true);
          },
          function (err) {
            bus.emit(data.errorEvent, err);
            bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
          });
        }
        else {
          bus.emit(data.errorEvent, err);
          bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
        }
      });
    }
    else {
      storage.append(data.type, data.name, data.obj).then(function (res) {
        bus.emit(data.busEvent, true);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
        bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
      });
    }
  });

  /**
   * Listen to remove item events.
   */
  bus.on('storage.remove.item', function (data) {
    storage.lock(data.type, data.name).then(function (file) {
      storage.load(data.type, data.name).then(function (res) {
        var item = res.find(function (item, index) {
          if (item.itemIdentifier === data.itemIdentifier) {
            res.splice(index, 1);
            return true;
          }

          return false;
        });

        if (item !== undefined) {
          if (res.length) {
            // Item found re-save the file.
            storage.save(data.type, data.name, res).then(function () {
              storage.unlock(file);
              bus.emit(data.busEvent, true);
            },
            function (err) {
              storage.unlock(file);
              bus.emit(data.errorEvent, err);
              bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
            });
          }
          else {
            // File data is empty, so remove the file.
            storage.unlock(file);
            storage.remove(data.type, data.name).then(function () {
              bus.emit(data.busEvent, true);
            },
            function (err) {
              bus.emit(data.errorEvent, err);
              bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
            });
          }
        }
        else {
          storage.unlock(file);
          bus.emit(data.busEvent, false);
        }
      },
      function (err) {
        storage.unlock(file);
        bus.emit(data.errorEvent, err);
        bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
      });
    },
    function (err) {
      bus.emit(data.errorEvent, err);
      bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
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
      bus.emit('logger.err', { 'type': 'storage', 'message': err.message });
    });
  });

  register(null, {
    storage: storage
  });
};
