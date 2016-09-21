# FBS plugin
Handel communication with FBS library system over the SIP2 protocol. 

## Configuration
Require configuration from the "ctrl" plugin on the "fbs.config" event.

```javascript
{
  "username": "sip2",
  "password": "password",
  "endpoint": "https://ET.Cicero-fbs.com/rest/sip2/DK-761500",
  "agency": "DK-761500"
}
```

# Events

  * On
    * fbs.login => { username, password, busEvent }
      - Request login to verify a patron exists with the credentials.
    * fbs.library.status => { busEvent }
      - Get basic information about the library and what is supports.
    * fbs.patron => { username, password, busEvent }
      - All information about a give patron (inc. reservations, loans etc).
    
  * Emit
    

# Example usage

### Error handling.
```javascript
bus.on('fbs.err', function(err) {
  console.log(err);
});
```

### Login request
```javascript
bus.on('fbs.login.test', function(data) {
  if (data) {
    console.log('Valid');
  }
  else {
    console.log('Not valid');
  }
});
bus.emit('fbs.login', {
  'username': '12345567890',
  'password': '1234',
  'busEvent': 'fbs.login.test'
});
```