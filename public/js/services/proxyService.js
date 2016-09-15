angular.module('BibBox').service('proxyService', [
  function () {
    'use strict';

    var socket = io();

    this.emitEvent = function(emitEvent, callbackEvent, errorEvent, callback, errorCallback) {
      socket.once(callbackEvent, function (event, data) {
        callback(data);
      });
      socket.once(errorEvent, function (event, err) {
        errorCallback(err);
      });
      socket.emit(emitEvent);
    }
  }
]);