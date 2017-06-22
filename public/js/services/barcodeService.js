/**
 * @file
 * Service for barcode events.
 */

angular.module('BibBox').service('barcodeService', ['$q', 'proxyService',
  function ($q, proxyService) {
    'use strict';

    var currentScope = null;

    /**
     * Helper function to check current scope for a give method.
     *
     * @param method
     *   Method to lookup
     *
     * @returns {*|boolean}
     *   True if it exists else false.
     */
    function currentScopeHasMethod(method) {
      return currentScope[method] && typeof currentScope[method] === 'function';
    }

    /**
     * Scanned event handler.
     *
     * Place out here to enables us to remove listener.
     *
     * @param data
     *   The data processed by the barcode scanner.
     */
    function scanned(data) {
      if (currentScope && currentScopeHasMethod('barcodeScanned')) {
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
      if (currentScope && currentScopeHasMethod('barcodeError')) {
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
