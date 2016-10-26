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
    // Cleanup bus events for previous connections.
    bus.off('rfid.tags.request');
    bus.off('rfid.tag.set_afi');

    // Listener for rfid.tags.detected.request bus event.
    bus.on('rfid.tags.request', function () {
      ws.send(JSON.stringify({
        event: 'detectTags'
      }));
    });

    // Listener for rfid.tags.detected.request bus event.
    bus.on('rfid.tag.set_afi', function (data) {
      ws.send(JSON.stringify({
        event: 'setAFI',
        uid: data.uid,
        afi: data.afi ? afi.on : afi.off
      }));
    });

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
          case 'tagSet':
            console.log("tagSet not implemented.");
            break;
          case 'tagSetAFI':
            console.log("tagSetAFI not implemented.");
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
