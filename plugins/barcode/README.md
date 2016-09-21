# Barcode plugin
This plugin handles communication with the barcode reader, which is used to
read library cards and library material i the case where RFID do not work.

# Events

  * On
    * barcode.list => { busEvent }
      - list all HID devices connected to the system send back the event sent as
        callback
    * barcode.start ()
      - Starts the barcode reader events.
    * barcode.stop ()
      - Stops the barcode reader events.

  * Emit
    * barcode.data
      - Send the scanned barcode as a string.
    * barcode.err
      - Send error message.

# Example usage

### Error handling
This will be emitted when the barcode scanner is not found.

```javascript
bus.on('barcode.err', function(err) {
  console.log(err);
});
```

### List available HID devices connected. 
```javascript
bus.on('bartest', function(data) {
  console.log(data);
});
bus.emit(barcode.list, {
  'busEvent': 'bartest'
});
```

### Get barcode data form the connected device.
```javascript
bus.on('barcode.data', function(data) {
  console.log(data);
  bus.emit(barcode.stop);
});
bus.emit(barcode.start);
```