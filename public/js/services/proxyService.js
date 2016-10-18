/**
 * @file
 * proxyService for communication with backend.
 */

angular.module('BibBox').service('proxyService', ['$rootScope', '$q', '$location', '$route', 'config', '$translate',
  function ($rootScope, $q, $location, $route, config, $translate) {
    'use strict';

    var self = this;

    /**
     * Get socket connection back to the host that load the page.
     *
     * Wrapped in function to allow testing.
     *
     * @returns {*}
     *   The connected socket as an object.
     */
    self.getSocket = function getSocket() {
      return io.connect(location.protocol + '//' + location.hostname + (location.port ? ':'+location.port: ''), {
        'forceNew': true,
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax' : 5000,
        'reconnectionAttempts': Infinity
      });
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
     * Handled events from the socket connection.
     *
     * @param eventName
     *   Name of the event.
     * @param callback
     *   The callback to call when the event is fired.
     */
    this.onEvent = function onEvent(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    };

    /**
     * Cleanup event listeners.
     *
     * And re-register event listeners.
     */
    self.cleanup = function cleanup() {
      socket.removeAllListeners();
      self.registerListeners();
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
    };

    // Initialize.
    var socket = self.getSocket();
    self.registerListeners();
  }
]);