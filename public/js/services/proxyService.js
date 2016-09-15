angular.module('BibBox').service('proxyService', [
  function () {
    'use strict';

    var socket = io();

    this.emitEvent = function(emitEvent, callbackEvent, errorEvent, callback, errorCallback) {
      socket.once(callbackEvent, function (data) {
        callback(data);
      });
      socket.once(errorEvent, function (err) {
        console.log(err);
        errorCallback(err);
      });
      socket.emit(emitEvent);
    }
  }
]);