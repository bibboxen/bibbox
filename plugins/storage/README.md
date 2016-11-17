# Translation plugin
This plugin serves translation strings for the frontend.

# Events

  * On     
    * storage.load  => { type, name, busEvent }
      - Load storage object based on type and name.
    * storage.save => { type, name, obj, busEvent }
      - Save object into the storage.
    * storage.append => { type, name, obj, busEvent }
      - Append to storage object, assumes that the storage is an array and the
        content is pushed to the array (mainly used for off-line storage).
    * storage.remove => { type, name, busEvent }
      - Remove data (file) from storage.
    
# Example usage

### Update translations
```javascript
  bus.on('storage.test', function (status) {
    console.log
  });
  bus.emit('storage.append', {
    type: 'offline',
    name: data.timestamp,
    obj: {
      date: new Date().getTime(),
      action: 'checkin',
      item: data.itemIdentifier
    },
    busEvent: 'storage.test'
  });
```


