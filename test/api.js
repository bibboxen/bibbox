/**
 * @file
 * Test of the UI API.
 */

it('Test /api exists (501)', function(done) {
  server.get("/api")
    .expect(501)
    .end(function(err, res) {

      res.status.should.equal(501);

      done();
    });
});
