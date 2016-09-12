/**
 * @file
 * Mocha tests.
 *
 * Mocks see http://sinonjs.org/
 */

var supertest = require("supertest");
var should = require("should");

var server = supertest.agent("http://localhost:3010");

/**
 * API authentication tests.
 */
describe('API basic test', function() {

  it('Test /api exists (501)', function(done) {
    server.get("/api")
      .expect(501)
      .end(function(err, res) {

        res.status.should.equal(501);

        done();
      });
  });

});
