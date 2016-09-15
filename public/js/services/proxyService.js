angular.module('BibBox').service('proxyService', [
  function () {
    'use strict';

    var socket = io();

    this.emitEvent = function(emitEvent, callbackEvent, errorEvent, emitCallback, errorCallback, data) {
      socket.once(callbackEvent, function (data) {
        emitCallback(data);
      });
      socket.once(errorEvent, function (err) {
        errorCallback(err);
      });
      socket.emit(emitEvent, data);
    };
  }
]);