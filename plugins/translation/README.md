# Translation plugin
This plugin serves translation strings for the frontend.

# Events

  * On
    * config.translations  (callback)
      - returns all translations.
    * config.translations.update (translations)
      - updates translations on installation.
      - emits config.translations

  * Emit
    * config.translations
      - emits all translations following a config.translations.update event.

# Example usage

Update translations
```javascript
bus.emit('config.translations.update', {
  "da": {
    "string.one": "translation.one",
    "string.two": "translation.two"    
  },
  "en": {
    "string.one": "translation.one",
    "string.two": "translation.two"
  }
});
```

Request translations
```javascript
bus.on('config.translations.res', function (translations) {
  console.log(translations);
});

bus.emit('config.translations', 'config.translation.res');
```

Listen for translation changes
```javascript
bus.on('config.translations', function (translations) {
  console.log(translations);
});
```
