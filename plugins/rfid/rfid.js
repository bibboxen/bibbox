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

  // localhost
  var server = new WebSocketServer({ port: port });

  var setAFI = null;
  var requestTags = null;
  if (rfid_debug) {
    var fakeTags = require('./fakeTags.json');

    // Show in console that we are in debug mode.
    debug('RFID debug mode.');
    debug('RFID fake tags loaded: ' + fakeTags.length);

    // Send connected event.
    bus.emit('rfid.connected');

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
          fakeTags[index].afi = data.afi;
          return true;
        }
        return false;
      });

      // Tag found so return fakeTags afi for that tag.
      if (index != -1) {
        bus.emit('rfid.tag.afi.set', {
          uid: fakeTags[index].uid,
          afi: fakeTags[index].afi === afi.on
        })
      }
      else {
        bus.emit('rfid.error', 'AFI not set!')
      }
    });
  }
  else {
    // Connection set up.
    server.on('connection', function connection(ws) {
      // Cleanup bus events for previous connections.
      if (requestTags !== null) {
        bus.removeListener('rfid.tags.request', requestTags);
      }

      if (setAFI !== null) {
        bus.removeListener('rfid.tag.set_afi', setAFI);
      }

      requestTags = function requestTags() {
        try {
          ws.send(JSON.stringify({
            event: 'detectTags'
          }));
        }
        catch (err) {
          bus.emit('logger.err', err.message);
          debug(err.message);
        }
      };

      setAFI = function setAFI(data) {
        try {
          ws.send(JSON.stringify({
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

      // Register bus listeners.
      bus.on('rfid.tags.request', requestTags);
      bus.on('rfid.tag.set_afi', setAFI);

      ws.on('message', function incoming(message) {
        try {
          var data = JSON.parse(message);

          if (!data.event) {
            bus.emit('rfid.error', 'Event not set.');
            return;
          }

          switch(data.event) {
            case 'connected':
              bus.emit('rfid.connected');
              debug('Connected to web-socket');
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
                })
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
