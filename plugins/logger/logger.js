/**
 * @file
 * This is a wrapper class to handel the system logger.
 */

'use strict';

// Node core modules.
var path = require('path');
var util = require('util');

// NPM modules.
var winston = require('winston');
require('winston-daily-rotate-file');

var Logger = function Logger(logs) {
  var levels = winston.config.syslog.levels;
  levels.fbs = 8;
  levels.offline = 9;
  levels.frontend = 10;
  winston.setLevels(levels);

  if (logs.hasOwnProperty('info')) {
    this.infoLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new winston.transports.DailyRotateFile({
          filename: logs.info,
          dirname: path.join(__dirname, '../../' + logs.path),
          level: 'info',
          colorize: false,
          timestamp: true,
          json: false,
          keep: 30,
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
        new winston.transports.DailyRotateFile({
          filename: logs.debug,
          dirname: path.join(__dirname, '../../' + logs.path),
          level: 'debug',
          colorize: false,
          timestamp: true,
          json: false,
          keep: 30,
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
        new winston.transports.DailyRotateFile({
          filename: logs.error,
          dirname: path.join(__dirname, '../../' + logs.path),
          level: 'error',
          colorize: false,
          timestamp: true,
          json: false,
          keep: 30,
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
        new winston.transports.DailyRotateFile({
          name: 'fbs-file',
          filename: logs.fbs,
          dirname: path.join(__dirname, '../../' + logs.path),
          level: 'fbs',
          colorize: false,
          datePattern: '.dd-MM-yy',
          timestamp: true,
          json: false,
          maxFiles: 30,
          localTime: true,
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
        new winston.transports.DailyRotateFile({
          filename: logs.offline,
          dirname: path.join(__dirname, '../../' + logs.path),
          level: 'offline',
          colorize: false,
          timestamp: true,
          json: false,
          keep: 30,
          compress: false
        })
      ],
      exitOnError: false
    });
  }

  if (logs.hasOwnProperty('frontend')) {
    this.frontendLog = new (winston.Logger)({
      levels: levels,
      transports: [
        new winston.transports.DailyRotateFile({
          filename: logs.frontend,
          dirname: path.join(__dirname, '../../' + logs.path),
          level: 'frontend',
          colorize: false,
          timestamp: true,
          json: false,
          keep: 30,
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
 * Log front end message.
 *
 * @param {string} message
 *   The message to send to the logger.
 */
Logger.prototype.frontend = function frontend(message) {
  if (this.frontendLog !== undefined) {
    this.frontendLog.frontend(message);
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
    try {
      logger.error(message);
    }
    catch (exception) {
      console.error(exception.stack);
    }
  });

  bus.on('logger.info', function (message) {
    try {
      logger.info(message);
    }
    catch (exception) {
      console.error(exception.stack);
    }
  });

  bus.on('logger.debug', function (message) {
    try {
      logger.debug(message);
    }
    catch (exception) {
      console.error(exception.stack);
    }
  });

  bus.on('logger.fbs', function (message) {
    try {
      logger.fbs(message);
    }
    catch (exception) {
      console.error(exception.stack);
    }
  });

  bus.on('logger.offline', function (message) {
    try {
      logger.offline(message);
    }
    catch (exception) {
      console.error(exception.stack);
    }
  });

  bus.on('logger.frontend', function (message) {
    try {
      if (typeof message === 'object') {
        logger.frontend('Error: ' + util.inspect(message, false, 10, false));
      }
      else {
        logger.frontend(message);
      }
    }
    catch (exception) {
      console.error(exception.stack);
    }
  });

  // Register the plugin with the system.
  register(null, {
    logger: logger
  });
};
