/**
 * @file
 * @TODO
 */

'use strict';

/**
 * This object encapsulates the rfid.
 *
 * @param bus
 *
 * @constructor
 */
var RFID = function (bus) {
  var WebSocketServer = require('ws').Server;
  var server = new WebSocketServer({ port: 3001 });

  server.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);

      try {
        var data = JSON.parse(message);

        if (!data.event) {
          // @TODO: Log error.
          return;
        }

        console.log(data);

        switch(data.event) {
          case 'tagDetected':
            bus.emit('rfid.tagDetected', {
              uid: data.UID,
              mid: data.MID
            });
            break;
          case 'tagRemoved':
            bus.emit('rfid.tagRemoved', {
              uid: data.UID,
              mid: data.MID
            });
            break;
          case 'tagSet':
            console.log("tagSet not implemented.");
            break;
          case 'tagSetAFI':
            console.log("tagSetAFI not implemented.");
            break;
          default:
            console.log("Event not recognized!");
        }
      }
      catch (err) {
        // Ignore error.
        // @TODO: Log error.
      }
    });

    bus.on('rfid.detectTags', function () {
      setTimeout(function () {
        if (de)
        ws.send(JSON.stringify({event: 'tagDetected'}));
      }, 1000);
    })

    // Test.
    for (var i = 0; i < 10; i++) {
    }
  });
};

/**
 * Register the plugin with architect.
 */
module.exports = function (options, imports, register) {
  var rfid = new RFID(imports.bus);

  register(null, {rfid: rfid});
};
