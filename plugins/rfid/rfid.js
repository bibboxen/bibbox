/**
 * @file
 * Contains the socket connection to the RFID reader.
 */

'use strict';

var debug = require('debug')('bibbox:rfid');

/**
 * This object encapsulates the connector to RFID.
 *
 * @param {object} bus
 *   The event bus.
 * @param {string} port
 *   The web-socket port number to use.
 * @param {object} afi
 *   JSON object with the values to set for AFI.
 * @param {array} allowed
 *   Addresses allowed to connect to the WS.
 * @param {function} isEventExpired
 *   Used to test if an event message has expired.
 *
 * @constructor
 */
var RFID = function (bus, port, afi, allowed, isEventExpired) {
  var WebSocketServer = require('ws').Server;

  // Check if we are in RFID debug mode. Will return basic fake Id's to emulate
  // an RFID reader during development and testing.
  var rfid_debug = process.env.RFID_DEBUG || false;

  // Create web-socket server on localhost (127.0.0.1).
  var server = new WebSocketServer({ port: port });

  // When client connects to RFID web-socket this will be set.
  var currentWebSocket = null;

  /**
   * Is the client address allowed?
   *
   * @param address
   * @return {boolean} allowed?
   */
  var allowedAccess = function allowedAccess(address) {
    var allow = false;

    for (var i = 0; i < allowed.length; i++) {
      // Disconnect client if connecting from other address than allowed addresses.
      if (allowed[i] === address) {
        allow = true;
        break;
      }
    }

    return allow;
  };

  /**
   * Handler for setAFI bus calls.
   */
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
      bus.emit('logger.err', { 'type': 'RFID', 'message': err.message });
      debug(err.message);
    }
  };

  /**
   * Handler for requestTags bus calls.
   */
  var requestTags = function requestTags() {
    try {
      currentWebSocket.send(JSON.stringify({
        event: 'detectTags'
      }));
    }
    catch (err) {
      bus.emit('logger.err', { 'type': 'RFID', 'message': err.message });
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
      // Enrich tags with timestamps.
      for (var i in fakeTags) {
        fakeTags[i].timestamp = new Date().getTime() - i;
      }

      bus.emit('rfid.tags.detected', {
        timestamp: new Date().getTime(),
        rawTags: fakeTags
      });
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
          timestamp: new Date().getTime(),
          rawTag: {
            timestamp: new Date().getTime(),
            uid: fakeTags[index].uid,
            mid: fakeTags[index].mid,
            numberInSeries: fakeTags[index].numberInSeries,
            seriesLength: fakeTags[index].seriesLength,
            afi: fakeTags[index].afi === afi.on
          }
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
      // Check if client has access to use RFID.
      if (!allowedAccess(ws.upgradeReq.connection.remoteAddress)) {
        ws.close();
        return;
      }

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
              if (!isEventExpired(data.timestamp, debug)) {
                // Change from actual afi value to boolean.
                for (var i = 0; i < data.tags.length; i++) {
                  data.tags[i].afi = data.tags[i].afi === afi.on;
                }

                bus.emit('rfid.tags.detected', {
                  timestamp: new Date().getTime(),
                  rawTags: data.tags
                });
              }
              break;

            case 'rfid.tag.detected':
              if (!isEventExpired(data.timestamp, debug)) {
                // Change from actual afi value to boolean.
                data.tag.afi = data.tag.afi === afi.on;

                bus.emit('rfid.tag.detected', {
                  timestamp: new Date().getTime(),
                  rawTag: data.tag
                });
              }
              break;

            case 'rfid.tag.removed':
              data.tag.afi = data.tag.afi === afi.on;

              bus.emit('rfid.tag.removed', {
                timestamp: new Date().getTime(),
                rawTag: data.tag
              });
              break;

            case 'rfid.afi.set':
              if (data.success) {
                data.tag.afi = data.tag.afi === afi.on;

                bus.emit('rfid.tag.afi.set', {
                  timestamp: new Date().getTime(),
                  rawTag: data.tag
                });
              }
              else {
                bus.emit('rfid.error', {
                  timestamp: new Date().getTime(),
                  type: 'afi.set',
                  msg: 'AFI not set!',
                  tag: data.tag
                });
                debug('AFI not set for: ' + data);
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
 *
 * @param {array} options
 *   Options defined in app.js.
 * @param {array} imports
 *   The other plugins available.
 * @param {function} register
 *   Callback function used to register this plugin.
 */
module.exports = function (options, imports, register) {
  var rfid = new RFID(imports.bus, options.port, options.afi, options.allowed, options.isEventExpired);

  register(null, {
    rfid: rfid
  });
};
