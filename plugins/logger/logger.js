/**
 * @file
 * This is a wrapper class to handel the system logger.
 */

'use strict';

// Node core modules.
const util = require('util');

const Q = require('q');
const Logstash = require('logstash-client');
const uniqid = require('uniqid');

// Static logstash client across loggers.
let logstashClient = null;

const Logger = function Logger(config) {
  this.config = config;

  if (logstashClient === null) {
    logstashClient = new Logstash({
      type: 'tcp',
      host: config.logstash.host,
      port: config.logstash.port
    });
  }
};

/**
 * Create new FBS object.
 *
 * Static factory function to create FBS object with loaded config. This pattern
 * used to fix race conditions and to ensure that we have a constructor without
 * side effects.
 *
 * @param bus
 *   The event bus
 *
 * @returns {*|promise}
 *   Promise that the FBS object is created with configuration.
 */
Logger.create = function create(bus) {
  let deferred = Q.defer();
  let busEvent = 'logger.config.loaded' + uniqid();
  let errorEvent = 'logger.config.error' + uniqid();

  bus.once(busEvent, function (config) {
    deferred.resolve(new Logger(config));
  });

  bus.once(errorEvent, function (err) {
    deferred.reject(err);
  });

  bus.emit('ctrl.config.config', {
    busEvent: busEvent,
    errorEvent: errorEvent
  });

  return deferred.promise;
};

/**
 * Send message to log-stash.
 *
 * @param {string} level
 *   Log level for the message.
 * @param {string} message
 *   The message to send to the logger.
 */
Logger.prototype.send = function send(level, message) {
  let self = this.config;
  if (logstashClient !== null) {
    // This is for to support legacy log messages.
    let type = 'unknown';
    if (message.hasOwnProperty('type')) {
      type = message.type.toLowerCase();
    }
    let msg = message;
    if (message.hasOwnProperty('message')) {
      msg = message.message;
    }

    // Create the best possible logging message for searching in FBS messages.
    if (type === 'fbs' && level === 'info') {
      let parts = {
        'id': msg.slice(0, 2),
        'raw': msg,
        'xml': message.hasOwnProperty('xml') ? message.xml : 'No XML data'
      };

      // Find the first field in the messages and split the message into SIP2 parts.
      let firsts = [ 'AO', 'AP', 'CF', 'CN', 'BW', 'BV'];
      for (let i in firsts) {
        let index = msg.indexOf(firsts[i]);
        if (index !== -1) {
          msg.slice(index).split('|').forEach(function (val) {
            if (val) {
              parts[val.slice(0, 2)] = val.slice(2);
            }
          });
          break;
        }
      }
      msg = parts;
    }

    logstashClient.send({
      '@timestamp': new Date(),
      'message': msg,
      'level': level,
      'type': type,
      'name': self.machine_name,
      'location': self.location
    });
  }
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
   // Add event listeners to logging events on the bus. For some reason they need
  // to have a inner function to work!
  let bus = imports.bus;
  bus.on('logger.err', function (message) {
    Logger.create(bus).then(function (logger) {
        logger.send('error', message);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      }
    );
  });

  bus.on('logger.warn', function (message) {
    Logger.create(bus).then(function (logger) {
        logger.send('warn', message);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      }
    );
  });

  bus.on('logger.info', function (message) {
    Logger.create(bus).then(function (logger) {
        logger.send('info', message);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      }
    );
  });

  bus.on('logger.debug', function (message) {
    Logger.create(bus).then(function (logger) {
        logger.send('debug', message);
      },
      function (err) {
        bus.emit(data.errorEvent, err);
      }
    );
  });

  register(null, {});
};
