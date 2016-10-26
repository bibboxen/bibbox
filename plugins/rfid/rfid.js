/**
 * @file
 * Contains the socket connection to the RFID reader.
 */

'use strict';

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
  var server = new WebSocketServer({ port: port });

  // Connection set up.
  server.on('connection', function connection(ws) {
    var requestTags = function requestTags() {
      ws.send(JSON.stringify({
        event: 'detectTags'
      }));
    };

    var setAFI = function setAFI(data) {
      ws.send(JSON.stringify({
        event: 'setAFI',
        uid: data.uid,
        afi: data.afi ? afi.on : afi.off
      }));
    };

    // Cleanup bus events for previous connections.
    bus.removeListener('rfid.tags.request', requestTags);
    bus.removeListener('rfid.tag.set_afi', setAFI);

    // Listener for rfid.tags.detected.request bus event.
    bus.on('rfid.tags.request', requestTags);

    // Listener for rfid.tags.detected.request bus event.
    bus.on('rfid.tag.set_afi', setAFI);

    ws.on('message', function incoming(message) {
      try {
        var data = JSON.parse(message);

        if (!data.event) {
          bus.emit('rfid.error', "Event not set.");
          return;
        }

        switch(data.event) {
          case 'connected':
            bus.emit('rfid.connected');
            break;
          case 'tagsDetected':
            bus.emit('rfid.tags.detected', {
              tags: data.tags
            });
            break;
          case 'tagDetected':
            bus.emit('rfid.tag.detected', {
              tag: data.tag
            });
            break;
          case 'tagRemoved':
            bus.emit('rfid.tag.removed', {
              tag: data.tag
            });
            break;
          case 'tagSetResult':
            console.log("tagSet not implemented.");
            break;
          case 'tagSetAFIResult':
            if (data.success) {
              bus.emit('rfid.tag.afi.set', {
                uid: data.UID,
                afi: data.AFI
              })
            }
            else {
              bus.emit('rfid.')
            }

            break;
          default:
            // @TODO: Log error.
            console.log("Event not recognized!");
        }
      }
      catch (err) {
        bus.emit('rfid.error', 'JSON parse error: ' + err);
      }
    });
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var rfid = new RFID(imports.bus, options.port, options.afi);

  register(null, {rfid: rfid});
};
