/**
 * @file
 * Test of the UI API.
 */

var app = null;
var setup = function setup() {
  var path = require('path');

  if (!app) {
    // Load config file.
    var config = require(__dirname + '/../config.json');

    // Configure the plugins.
    var plugins = [
      {
        "packagePath": "./../plugins/bus"
      },
      {
        "packagePath": "./../plugins/api"
      },
      {
        "packagePath": "./../plugins/server",
        "port": config.port,
        "path": path.join(__dirname, 'public')
      }
    ];

    app = setupArchitect(plugins, config);
  }

  return app;
};


it('Test /api exists (501)', function(done) {
  setup().then(function (app) {
    server.get("/api")
      .expect(501)
      .end(function(err, res) {

        res.status.should.equal(501);

        done();
      });
  });
});

it('Teardown', function(done) {
  setup().then(function (app) {
    app.destroy();
    done();
  }, done);
});
