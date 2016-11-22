/**
 * @file
 * Handel barcode events.
 */

angular.module('BibBox').service('barcodeService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

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
      if (currentScope) {
        currentScope.barcodeScanned(data);
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
      if (currentScope) {
        currentScope.barcodeError(err);
      }
    }

    /**
     * Start listing for barcode events.
     *
     * @param scope
     *   The scope to emit events into when data is received.
     */
    this.start = function start(scope) {
      currentScope = scope;

      proxyService.emit('barcode.start');
    };

    /**
     * Stop listing for barcode events.
     */
    this.stop = function stop() {
      currentScope = null;

      proxyService.emit('barcode.stop');
    };

    // Register listeners.
    proxyService.on('barcode.data', scanned);
    proxyService.on('barcode.err', error);
  }
]);
