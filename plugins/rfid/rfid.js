/**
 * @file
 * Contains the socket connection to the RFID reader.
 */

'use strict';

var debug = require('debug')('bibbox:rfid');

/**
 * This object encapsulates the connector to RFID.
 *
 * Assumes only one connection to RFID.
 *
 * @param bus
 * @param port
 * @param afi
 *
 * @constructor
 */
var RFID = function (bus, port, afi) {
  var WebSocketServer = require('ws').Server;

  // Check if we are in RFID debug mode. Will return basic fake Id's to emulate
  // an RFID reader during development and testing.
  var rfid_debug = process.env.RFID_DEBUG || false;

  // Create web-socket server on localhost (127.0.0.1).
  var server = new WebSocketServer({ port: port });

  // When client connects to RFID web-socket this will be set.
  var currentWebSocket = null;

  var setAFI = function setAFI(data) {
    try {
      currentWebSocket.send(JSON.stringify({
        event: 'setAFI',
        tag: {
          uid: data.uid,
          afi: data.afi ? afi.on : afi.off
        }
      }));
    }
    catch (err) {
      bus.emit('logger.err', err.message);
      debug(err.message);
    }
  };

  var requestTags = function requestTags() {
    try {
      currentWebSocket.send(JSON.stringify({
        event: 'detectTags'
      }));
    }
    catch (err) {
      bus.emit('logger.err', err.message);
      debug(err.message);
    }
  };

  if (rfid_debug) {
    var fakeTags = require('./fakeTags.json');

    // Fake connect to get online.
    bus.emit('rfid.connected');
    debug('Web-socket fake connected');

    // Show in console that we are in debug mode.
    debug('RFID debug mode.');
    debug('RFID fake tags loaded: ' + fakeTags.length);

    // Send connected event.
    // Emulate that the connection is tested every 10s.
    setInterval(function () {
      bus.emit('rfid.connected');
    }, 10000);

    /**
     * Tag request fake response.
     */
    bus.on('rfid.tags.request', function () {
      bus.emit('rfid.tags.detected', fakeTags);
    });

    /**
     * Set AFI fake response.
     */
    bus.on('rfid.tag.set_afi', function (data) {
      // Check if tag exists in fakeTags and return index.
      var index = fakeTags.findIndex(function (tag, index) {
        if (tag.uid === data.uid) {
          // Tag found change afi.
          fakeTags[index].afi = data.afi ? afi.on : afi.off;
          return true;
        }
        return false;
      });

      // Tag found so return fakeTags afi for that tag.
      if (index !== -1) {
        bus.emit('rfid.tag.afi.set', {
          uid: fakeTags[index].uid,
          afi: fakeTags[index].afi === afi.on
        });
      }
      else {
        bus.emit('rfid.error', 'AFI not set!');
      }
    });
  }
  else {
    // Connection set up.
    server.on('connection', function connection(ws) {
      currentWebSocket = ws;

      // Inform the UI that connection with RFID is open.
      bus.emit('rfid.connected');
      debug('Web-socket connected');

      // Register bus listeners.
      bus.on('rfid.tags.request', requestTags);
      bus.on('rfid.tag.set_afi', setAFI);

      // Cleanup bus events for previous connections.
      currentWebSocket.on('close', function close() {
        bus.removeListener('rfid.tags.request', requestTags);
        bus.removeListener('rfid.tag.set_afi', setAFI);

        // Inform the UI that connection with RFID is closed.
        bus.emit('rfid.closed');
        debug('Web-socket closed');

        currentWebSocket = null;
      });

      currentWebSocket.on('message', function incoming(message) {
        try {
          var data = JSON.parse(message);

          if (!data.event) {
            bus.emit('rfid.error', 'Event not set.');
            return;
          }

          switch (data.event) {
            case 'rfid.offline':
              bus.emit('rfid.closed');

              break;

            case 'rfid.processing':
              bus.emit('rfid.processing');

              break;

            case 'rfid.online':
              bus.emit('rfid.connected');

              break;

            case 'rfid.tags.detected':
              bus.emit('rfid.tags.detected', data.tags);
              break;

            case 'rfid.tag.detected':
              bus.emit('rfid.tag.detected', data.tag);
              break;

            case 'rfid.tag.removed':
              bus.emit('rfid.tag.removed', data.tag);
              break;

            case 'rfid.afi.set':
              if (data.success) {
                bus.emit('rfid.tag.afi.set', {
                  uid: data.tag.uid,
                  afi: data.tag.afi === afi.on
                });
              }
              else {
                bus.emit('rfid.error', 'AFI not set!');
                debug('AFI not set for uid: ' + data.tag.uid);
              }
              break;

            default:
              bus.emit('rfid.error', 'Event not recognized!');
              debug('Event not recognized!');
          }
        }
        catch (err) {
          bus.emit('rfid.error', 'JSON parse error: ' + err);
          debug('JSON parse error: ' + err);
        }
      });
    });
  }
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var rfid = new RFID(imports.bus, options.port, options.afi);

  register(null, {
    rfid: rfid
  });
};
