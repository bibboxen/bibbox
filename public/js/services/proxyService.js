/**
 * @file
 * proxyService for communication with backend.
 */

angular.module('BibBox').service('proxyService', ['$q', '$location', '$route', 'config', '$translate', 'Idle',
  function ($q, $location, $route, config, $translate, idle) {
    'use strict';

    var self = this;

    /**
     * Get socket.
     *
     * Wrapped in function to allow testing.
     *
     * @returns {*}
     */
    self.getSocket = function getSocket() {
      return io();
    };

    /**
     * Emits an event to the backend.
     *
     * Emits an event and resolves the promise when the callbackEvent/errorEvent is called.
     * In some cases the backend expects a callback event in the data parameter,
     *   in these cases data and callbackEvent should be the same.
     *
     * @param emitEvent
     *   The event to emit through the socket.
     * @param callbackEvent
     *   The event to listen for with result.
     * @param errorEvent
     *   The event to listen for with error.
     * @param data
     *   The data to send with the event.
     *
     * @returns {*|promise}
     */
    self.emitEvent = function(emitEvent, callbackEvent, errorEvent, data) {
      // Try to connect to the server if not already connected.
      var deferred = $q.defer();

      // Register callback event listener.
      if (callbackEvent) {
        socket.once(callbackEvent, function (data) {
          deferred.resolve(data);
        });
      }

      // Register error event listener.
      if (errorEvent) {
        socket.once(errorEvent, function (err) {
          deferred.reject(err);
        });
      }

      // Send event to backend.
      socket.emit(emitEvent, data);

      return deferred.promise;
    };

    /**
     * Remove all of the given event listeners.
     *
     * @param event
     *   The event to stop listening for.
     */
    self.removeAllEventlisteners = function removeAllEventlisteners(event) {
      socket.removeAllListeners(event);
    };

    /**
     * Register socket listeners.
     *
     * Wrapped in function to allow testing.
     */
    self.registerListeners = function () {
      /**
       * Reloads the browser on the 'frontend.reload' event.
       */
      socket.on('frontend.reload', function () {
        $location.path('/');
        $route.reload();
      });

      /**
       * Sets translations on config.translations event.
       */
      socket.on('config.translations', function (translations) {
        config.translations = angular.copy(translations);
        $translate.refresh();
      });

      /**
       * Sets languages on config.languages event.
       */
      socket.on('config.languages', function (languages) {
        config.languages = angular.copy(languages);
      });

      /**
       * Sets features on config.features event.
       */
      socket.on('config.features', function (features) {
        config.features = angular.copy(features);
      });

      /**
       * Sets idle timeouts on config.
       */
      socket.on('config.idle_config', function (idleConfig) {
        config.idle = angular.copy(idleConfig);
        idle.setIdle(config.idle.idleTimeout);
        idle.setTimeout(config.idle.idleWarn);
      });
    };

    // Initialize.
    var socket = self.getSocket();
    self.registerListeners();
  }
]);