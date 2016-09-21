/**
 * @file
 * Unit test setup of translation plugin.
 */

var fs = require('fs');

/**
 * Setup the application plugin for proxy tests.
 */
var setup = function setup() {
  // Load config file.
  var config = require(__dirname + '/../config.json');

  // Configure the plugins.
  var plugins = [
    {
      "packagePath": "./../plugins/bus"
    },
    {
      "packagePath": "./../plugins/translation",
      "destination": "/files/test_translations_test.json"
    }
  ];

  return setupArchitect(plugins, config);
};

it('config.translation should return an object, with at least da and en translations', function (done) {
  this.timeout = 1500;

  setup().then(function (app) {
    // Make sure the translations have been written to disc and can be retrieved again.
    app.services.bus.on('config.translations', function (data) {
      data.should.be.a.Object();
      data.should.have.property('da').which.is.a.Object();
      data.should.have.property('en').which.is.a.Object();

      // Test that file has been created.
      fs.exists(__dirname + "/../plugins/translation/files/test_translations_test.json", function (exists) {
        exists.should.be.equal(true);

        // Cleanup translation test file.
        fs.unlink(__dirname + "/../plugins/translation/files/test_translations_test.json");

        done();
      });
    });

    // Emit new translations. This should result in config.translations event containing new translations.
    app.services.bus.emit('config.translations.update', {"da": {}, "en": {}});
  });

  // Give it 1 second to finish events.
  setTimeout(function () {}, 1000);
});
