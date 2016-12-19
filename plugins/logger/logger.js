/**
 * @file
 * This is a wrapper class to handel the system logger.
 */

'use strict';

// Node core modules.
var path = require('path');

// NPM modules.
var winston = require('winston');
var Rotate = require('winston-logrotate').Rotate;

var Logger = function Logger(logs) {
  var levels = winston.config.syslog.levels;
  levels.fbs = 8;
  levels.offline = 9;
  winston.setLevels(levels);

  if (logs.hasOwnProperty('info')) {
    this.infoLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new Rotate({
          file: path.join(__dirname, '../../' + logs.info),
          level: 'info',
          colorize: false,
          timestamp: true,
          json: false,
          max: '100m',
          keep: 5,
          compress: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('debug')) {
    this.debugLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new Rotate({
          file: path.join(__dirname, '../../' + logs.debug),
          level: 'debug',
          colorize: false,
          timestamp: true,
          json: false,
          max: '100m',
          keep: 5,
          compress: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('error')) {
    this.errorLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new Rotate({
          file: path.join(__dirname, '../../' + logs.error),
          level: 'error',
          colorize: false,
          timestamp: true,
          json: false,
          max: '100m',
          keep: 5,
          compress: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('fbs')) {
    this.fbsLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new (winston.transports.DailyRotateFile)({
          name: 'fbs-file',
          filename: path.join(__dirname, '../../' + logs.fbs),
          level: 'fbs',
          colorize: false,
          datePattern: '.dd-MM-yyTHH',
          timestamp: true,
          json: false,
          maxFiles: 30,
          zippedArchive: false
        })
      ],
      exitOnError: true
    });
  }

  if (logs.hasOwnProperty('offline')) {
    this.offlineLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new Rotate({
          file: path.join(__dirname, '../../' + logs.offline),
          level: 'offline',
          colorize: false,
          timestamp: true,
          json: false,
          max: '100m',
          keep: 5,
          compress: false
        })
      ],
      exitOnError: false
    });
  }
};

/**
 * Log error message.
 *
 * @param {string} message
 *   The message to send to the logger.
 */
Logger.prototype.error = function error(message) {
  if (this.errorLog !== undefined) {
    this.errorLog.error(message);
  }
};

/**
 * Log info message.
 *
 * @param {string} message
 *   The message to send to the logger.
 */
Logger.prototype.info = function info(message) {
  if (this.infoLog !== undefined) {
    this.infoLog.info(message);
  }
};

/**
 * Log debug message.
 *
 * @param {string} message
 *   The message to send to the logger.
 */
Logger.prototype.debug = function debug(message) {
  if (this.debugLog !== undefined) {
    this.debugLog.debug(message);
  }
};

/**
 * Log fbs message.
 *
 * @param {string} message
 *   The message to send to the logger.
 */
Logger.prototype.fbs = function fbs(message) {
  if (this.fbsLog !== undefined) {
    this.fbsLog.fbs(message);
  }
};

/**
 * Log off-line message.
 *
 * @param {string} message
 *   The message to send to the logger.
 */
Logger.prototype.offline = function offline(message) {
  if (this.offlineLog !== undefined) {
    this.offlineLog.offline(message);
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
  var logger = new Logger(options.logs);

  // Add event listeners to logging events on the bus. For some reason they need
  // to have a inner function to work!
  var bus = imports.bus;
  bus.on('logger.err', function (message) {
    logger.error(message);
  });

  bus.on('logger.info', function (message) {
    logger.info(message);
  });

  bus.on('logger.debug', function (message) {
    logger.debug(message);
  });

  bus.on('logger.fbs', function (message) {
    logger.fbs(message);
  });

  bus.on('logger.offline', function (message) {
    logger.offline(message);
  });

  // Register the plugin with the system.
  register(null, {
    logger: logger
  });
};
