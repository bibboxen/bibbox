# Network plugin
Check if network connect to a service exists.

# Events

  * On
    * network.online => { url, busEvent }
      - Return TRUE if server is online else FALSE.

  * Emit

# Example usage

Error handling (this will be emitted when the barcode scanner is not found).
```javascript
bus.on('network.online.google', function(online) {
  if (online) {
    console.log('It is alive!');
  }
  else {
    console.log('It is dead man!');    
  }
});

bus.emit('network.online', {
  'url': 'http://google.dk',
  'busEvent': 'network.online.google'
});
```