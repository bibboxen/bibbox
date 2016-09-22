# Translation plugin
This plugin serves translation strings for the frontend.

# Events

  * On
    * config.translations.request => { busEvent }
      - emits data.busEvent with all translations
    * config.translations.update => { translations, busEvent }
      - updates translations on installation with data.translations.
      - emits data.busEvent

  * Emits
    * config.translations
      - emits all translations following a config.translations.update event.
      - data format:
      <pre>
      {
        "da": {
          "string.one": "translation.one",
          "string.two": "translation.two"
        },
        "en": {
          "string.one": "translation.one",
          "string.two": "translation.two"
        }
      }
      </pre>


# Example usage

### Update translations
```javascript
bus.emit('config.translations.update', {
  "translations": {
    "da": {
      "string.one": "translation.one",
      "string.two": "translation.two"    
    },
    "en": {
      "string.one": "translation.one",
      "string.two": "translation.two"
    }
  },
  "busEvent": "config.translations"
});
```

This results in the translation file on the server being updated and 
the event 'config.translations' being fired containing the new translations.

### Request translations
```javascript
bus.on('config.translations.response', function (translations) {
  console.log(translations);
});

bus.emit('config.translations.request', {"busEvents": "config.translations.response"});
```

### Listen for translation changes
```javascript
bus.on('config.translations', function (translations) {
  console.log(translations);
});
```
