/**
 * @file
 * proxyService for communication with backend.
 */

angular.module('BibBox').service('proxyService', ['$q', '$location', '$route', 'config', '$translate',
  function ($q, $location, $route, config, $translate) {
    'use strict';

    /**
     * Get socket.
     *
     * Wrapped in function to allow testing.
     *
     * @returns {*}
     */
    this.getSocket = function getSocket() {
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
     * @param callbackEvent
     * @param errorEvent
     * @param data
     * @returns {*|promise}
     */
    this.emitEvent = function(emitEvent, callbackEvent, errorEvent, data) {
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

    this.registerListeners = function () {
      /**
       * Reloads the browser on the 'frontend.reload' event.
       */
      socket.on('frontend.reload', function () {
        $location.path('/');
        $route.reload();
      });

      /**
       * Loads translations on frontend.translations event.
       */
      socket.on('config.translations', function (translations) {
        config.translations = angular.copy(translations);
        $translate.refresh();
      });
    };

    var socket = this.getSocket();
    this.registerListeners();
  }
]);