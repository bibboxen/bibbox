/**
 * @file
 * Storage plugin.
 *
 * @NOTES: Different stores config, translations and off-line.
 */

'use strict';

var jsonfile = require('jsonfile');
var fs = require('fs');

var Storage = function Storage(bus, paths) {
  this.path = __dirname + '/../../' + paths.base + '/';
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
  var file = this.path + type + '/' + name + '.json';
  return jsonfile.readFileSync(file);
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
  var file = this.path + type + '/' + name + '.json';
  return jsonfile.writeFileSync(file, obj, {
    spaces: 2
  });
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
  try {
    var data = this.load(type, name);
    data.push(obj);
  }
  catch (err) {
    if (err.code === 'ENOENT') {
      // File don't exists. Set data to the parsed in object.
      data = [ obj ];
    }
    else {
      throw err;
    }
  }

  return this.save(type, name, data);
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
  try {
    var file = this.path + type + '/' + name + '.json';
    fs.unlinkSync(file);
  }
  catch (err) {
    throw err;
  }
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
    try {
      bus.emit(data.busEvent, storage.load(data.type, data.name));
    }
    catch (err) {
      bus.emit(data.busEvent, err);
      bus.emit('logger.err', err.message);
    }
  });

  /**
   * Listen to save requests.
   */
  bus.on('storage.save', function (data) {
    try {
      storage.save(data.type, data.name, data.obj);
      bus.emit(data.busEvent, true);
    }
    catch (err) {
      bus.emit(data.busEvent, err);
      bus.emit('logger.err', err.message);
    }
  });

  /**
   * Listen to append requests.
   */
  bus.on('storage.append', function (data) {
    try {
      storage.append(data.type, data.name, data.obj);
      bus.emit(data.busEvent, true);
    }
    catch (err) {
      bus.emit(data.busEvent, err);
      bus.emit('logger.err', err.message);
    }
  });

  /**
   * Listen to remove requests.
   */
  bus.on('storage.remove', function (data) {
    try {
      storage.remove(data.type, data.name);
      bus.emit(data.busEvent, true);
    }
    catch (err) {
      bus.emit(data.busEvent, err);
      bus.emit('logger.err', err.message);
    }
  });

  register(null, {
    storage: storage
  });
};
