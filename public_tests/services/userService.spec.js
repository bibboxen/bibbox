describe('userService', function () {

  var userService;
  var $q;

  beforeEach(function () {
    module('BibBox');

    module(function ($provide) {
      $provide.service('proxyService', function () {
        this.getSocket = function () {
          return null;
        };
        this.emitEvent = function (a, b, c, d) {
          var deferred = $q.defer();

          return deferred.promise;
        };
        this.registerListeners = function () {
        };
      });
    });

    inject(function (_userService_, _$q_) {
      $q = _$q_;
      userService = _userService_;
    });
  });

  it('should be logged out by default', function () {
    expect(userService.userLoggedIn()).to.equal(false);
  });
});