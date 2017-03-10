/**
 * @file
 * Expose logging messages to the backend logs.
 *
 * @TODO: If in debug mode also log to console.
 */
angular.module('BibBox').service('loggerService', ['$q', 'proxyService',
  function ($q, proxyService) {
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
      message = 'ERR: ' + message;
      proxyService.emit('logger.frontend', message);
    };

    /**
     * Send log message to backend prefixed with "INFO".
     *
     * @param {string} message
     *   The message to log.
     */
    this.info = function info(message) {
      message = 'INFO: ' + message;
      proxyService.emit('logger.frontend', message);
    };

    /**
     * Send log message to backend prefixed with "DEBUG".
     *
     * @param {string} message
     *   The message to log.
     */
    this.debug = function debug(message) {
      message = 'DEBUG: ' + message;
      proxyService.emit('logger.frontend', message);
    };
  }
]);
