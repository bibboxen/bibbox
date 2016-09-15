angular.module('BibBox').service('proxyService', [
  function () {
    'use strict';

    var socket = io();

    this.emitEvent = function(emitEvent, callbackEvent, callback) {
      socket.once(callbackEvent, function (event, data) {
        callback(data);
      });
      socket.emit(emitEvent);
    }
  }
]);