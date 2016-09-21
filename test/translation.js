/**
 * @file
 * Unit test setup of translation plugin.
 */

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
      "packagePath": "./../plugins/translation"
    }
  ];

  return setupArchitect(plugins, config);
};

it('config.translation should return an object, with at least da and en translations', function () {
  return setup().then(function (app) {
    app.services.bus.on('config.translations.test', function (data) {
      data.should.be.a.Object();
      data.should.have.property('da').which.is.a.Object();
      data.should.have.property('en').which.is.a.Object();
    });

    app.services.bus.emit('config.translations', 'config.translations.test');
  });
});
