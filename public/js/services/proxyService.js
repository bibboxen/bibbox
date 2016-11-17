/**
 * @file
 * proxyService for communication with backend.
 */

angular.module('BibBox').service('proxyService', ['$rootScope', '$q', '$location', '$route',
  function ($rootScope, $q, $location, $route) {
    'use strict';

    /**
     * Get socket connection back to the host that load the page.
     *
     * Wrapped in function to allow testing.
     *
     * @returns {*}
     *   The connected socket as an object.
     */
    this.getSocket = function getSocket() {
      return io.connect(location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : ''), {
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
      });
    };

    /**
     * Emits an event to the backend.
     *
     * @param eventName
     *   Name of the event.
     * @param data
     *   The data to send with the event.
     *
     * @returns {*|promise}
     */
    this.emit = function emit(eventName, data) {
      socket.emit(eventName, data);
    };

    /**
     * Handled events from the socket connection.
     *
     * @param eventName
     *   Name of the event.
     * @param callback
     *   The callback to call when the event is fired.
     */
    this.on = function on(eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    };

    /**
     * Handled once events from the socket connection.
     *
     * @param eventName
     *   Name of the event.
     * @param callback
     *   The callback to call when the event is fired.
     */
    this.once = function once(eventName, callback) {
      socket.once(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    };

    /**
     * Register socket listeners.
     *
     * Wrapped in function to allow testing.
     */
    this.registerListeners = function registerListeners() {


      // Listen for disconnection with the backend.
      socket.on('disconnect', function() {
        $rootScope.$emit('out-of-order.enable', 'nodejs');
      });

      // Listen for connection with the backend.
      socket.on('reconnect', function() {
        $rootScope.$emit('out-of-order.disable', 'nodejs');
      });

      // Listen for disconnection with the backend.
      socket.on('rfid.closed', function() {
        $rootScope.$emit('out-of-order.enable', 'rfid');
      });

      // Listen for connection with the backend.
      socket.on('rfid.connected', function() {
        $rootScope.$emit('out-of-order.disable', 'rfid');
      });

      // Reloads the browser on the 'frontend.reload' event.
      socket.on('frontend.reload', function () {
        $location.path('/');
        $route.reload();
      });
    };

    // Initialize.
    var socket = this.getSocket();
    this.registerListeners();
  }
]);
