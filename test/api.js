/**
 * @file
 * Test of the UI API.
 */

var setup = function setup() {
  var path = require('path');

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

  return setupArchitect(plugins, config);
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
