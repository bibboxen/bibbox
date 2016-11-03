# Logger plugin
Log events to log files.

# Events

  * On
    * logger.info 
      - Log information to info log.
    * logger.err 
      - Log information to error log.
    * logger.debug
      - Log information to debug log.
    * logger.fbs
      - Log information to fbs log.

# Example usage

### Information message
```javascript
var ip = '127.0.0.1';
bus.emit('logger.info', 'User logged in from ' + ip);
```
### Debug message
```javascript
bus.emit('logger.debug', 'User was here');
```
### Error message
```javascript
bus.emit('logger.err', new Error('Error in plugin xxxx'));
bus.emit('logger.err', 'Error in plugin xxxx');
```