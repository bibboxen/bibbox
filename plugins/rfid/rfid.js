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
  // localhost
  var server = new WebSocketServer({ port: port });

  // Connection set up.
  server.on('connection', function connection(ws) {
    var requestTags = function requestTags() {
      try {
        ws.send(JSON.stringify({
          event: 'detectTags'
        }));
      }
      catch (err) {
        console.log(err);
        // Ignore.
      }
    };

    var setAFI = function setAFI(data) {
      try {
        ws.send(JSON.stringify({
          event: 'setAFI',
          UID: data.UID,
          AFI: data.AFI ? afi.on : afi.off
        }));
      }
      catch (err) {
        console.log(err);
        // Ignore.
      }
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
          bus.emit('rfid.error', 'Event not set.');
          return;
        }

        switch(data.event) {
          case 'connected':
            bus.emit('rfid.connected');
            break;
          case 'tagsDetected':
            bus.emit('rfid.tags.detected', data.tags);
            break;
          case 'tagDetected':
            bus.emit('rfid.tag.detected', data.tag);
            break;
          case 'tagRemoved':
            bus.emit('rfid.tag.removed', data.tag);
            break;
          case 'setTagResult':
            console.log('tagSet not implemented.');
            break;
          case 'setAFIResult':
            console.log(data);

            if (data.success) {
              bus.emit('rfid.tag.afi.set', {
                UID: data.UID,
                AFI: data.AFI === afi.on
              })
            }
            else {
              bus.emit('rfid.error', 'AFI not set!')
            }
            break;
          default:
            bus.emit('rfid.error', 'Event not recognized!');
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
