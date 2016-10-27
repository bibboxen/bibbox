# Translation plugin
This plugin serves translation strings for the frontend.

# Events

  * On     
    * translations.request  => { busEvent }
      - Get all translations for the UI.
    * translations.request.lang  => { lang, busEvent }
      - Get translations for a given language for the UI.

# Example usage

### Update translations
```javascript
  bus.on('translations.request.languages', function (data) {
    if (data instanceof Error) {
      console.log(error);
    }
    else {
      console.log(data);
    }
  });
  this.bus.emit('translations.request', {busEvent: 'translations.request.languages'});
```


