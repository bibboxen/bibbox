/**
 * @file
 * Handel barcode events.
 */

angular.module('BibBox').factory('barcodeService', ['$q', 'basicService', 'proxyService',
  function ($q, basicService, proxyService) {
    'use strict';

    // Extend this service with the basicService. It's copy to ensure that it is
    // not overridden, if not copy the extend will return an reference.
    var service = angular.extend(angular.copy(basicService), {});

    var currentScope = null;

    /**
     * Scanned event handler.
     *
     * Place out here to enables us to remove listener.
     *
     * @param data
     *   The data processed by the barcode scanner.
     */
    function scanned(data) {
      if (currentScope && !service.isEventExpired(data.timestamp, 'barcode.data', data)) {
        currentScope.barcodeScanned(data.code);
      }
    }

    /**
     * Error event handler.
     *
     * Place out here to enables us to remove listener.
     *
     * @param err
     *   The error
     */
    function error(err) {
      if (currentScope && !service.isEventExpired(err.timestamp, 'barcode.err', data)) {
        currentScope.barcodeError(err);
      }
    }

    /**
     * Start listing for barcode events.
     *
     * @param scope
     *   The scope to emit events into when data is received.
     */
    service.start = function start(scope) {
      currentScope = scope;

      proxyService.emit('barcode.start');
    };

    /**
     * Stop listing for barcode events.
     */
    service.stop = function stop() {
      currentScope = null;

      proxyService.emit('barcode.stop');
    };

    // Register listeners.
    proxyService.on('barcode.data', scanned);
    proxyService.on('barcode.err', error);

    return service;
  }
]);
