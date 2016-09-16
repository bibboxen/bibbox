angular.module('BibBox').service('proxyService', ['$q',
  function ($q) {
    'use strict';

    var socket = io();

    this.emitEvent = function(emitEvent, callbackEvent, errorEvent, data) {
      // Try to connect to the server if not already connected.
      var deferred = $q.defer();

      if (callbackEvent) {
        socket.once(callbackEvent, function (data) {
          deferred.resolve(data);
        });
      }

      if (errorEvent) {
        socket.once(errorEvent, function (err) {
          deferred.reject(err);
        });
      }

      socket.emit(emitEvent, data);

      return deferred.promise;
    };
  }
]);