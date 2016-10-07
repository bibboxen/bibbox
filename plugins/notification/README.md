# Notification plugin
Receipt service that can sent notification mail or print receipt on the default
system printer.

## Configuration
Required configuration from the "ctrl" plugin on the "config.notification" event.

# Events

  * On
    * notification.status => { username, password, mail, busEvent }
      - Patron status mail or printed receipt (if mail is true mail is sent else printed).

  * Emit
    

# Example usage

### Status request
```javascript
bus.on('notification.test.sent', function(data) {
  if (data) {
    console.log('Sent');
  }
  else {
    console.log('Check error logs');
  }
});
bus.emit('notification.status', {
  'username': '12345567890',
  'password': '1234',
  'mail': true,
  'busEvent': 'notification.test.sent'
});
```