/**
 * @file
 * Expose logging messages to the backend logs.
 *
 * @TODO: If in debug mode also log to console.
 */
angular.module('BibBox').service('loggerService', ['$q', 'proxyService', 'config',
  function ($q, proxyService, config) {
    'use strict';

    var self = this;

    /**
     * Try catching all browser errors and log them.
     */
    window.onerror = function onerror(message, url, lineNumber) {
      self.error(url + ':' + lineNumber + ' - ' + message);
    };

    /**
     * Send log message to backend prefixed with "ERR".
     *
     * @param {string} message
     *   The message to log.
     */
    this.error = function error(message) {
      proxyService.emit('logger.frontend', message);

      if (config.hasOwnProperty('debug') && config.debug) {
        if (typeof message === 'object') {
          console.error('error:', message);
        }
        console.error(message);
      }
    };

    /**
     * Send log message to backend prefixed with "INFO".
     *
     * @param {string} message
     *   The message to log.
     */
    this.info = function info(message) {
      proxyService.emit('logger.frontend', message);

      if (config.hasOwnProperty('debug') && config.debug) {
        if (typeof message === 'object') {
          console.log('info:', message);
        }
        console.log(message);
      }
    };

    /**
     * Send log message to backend prefixed with "DEBUG".
     *
     * @param {string} message
     *   The message to log.
     */
    this.debug = function debug(message) {
      proxyService.emit('logger.frontend', message);

      if (config.hasOwnProperty('debug') && config.debug) {
        if (typeof message === 'object') {
          console.debug('debug:', message);
        }
        console.debug(message);
      }
    };
  }
]);
