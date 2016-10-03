describe('userService', function () {

  var userService;
  var $q;
  var $rootScope;
  var proxyReturn = null;
  var proxyResolve = null;

  beforeEach(function () {
    module('BibBox');

    // Setup mock proxyService.
    module(function ($provide) {
      $provide.service('proxyService', function () {
        this.getSocket = function () {
          return null;
        };
        this.emitEvent = function (a, b, c, d) {
          var deferred = $q.defer();

          if (proxyResolve !== null) {
            if (proxyResolve) {
              deferred.resolve(proxyReturn);
            }
            else {
              deferred.reject(proxyReturn);
            }
          }

          return deferred.promise;
        };
        this.registerListeners = function () {
        };
      });
    });

    inject(function (_userService_, _$q_, _$rootScope_) {
      $q = _$q_;
      userService = _userService_;
      $rootScope = _$rootScope_;
    });
  });

  // Reset what the mock ProxyService returns after each run.
  afterEach(function () {
    proxyReturn = null;
    proxyResolve = null;
  });

  it('Should be logged out by default', function () {
    expect(userService.userLoggedIn()).to.equal(false);
  });

  it('If login is valid, user should be logged in', function () {
    proxyResolve = true;
    proxyReturn = true;

    // Login. Data is of no importance since we are mocking proxyService.
    userService.login('123', '123');

    // Make sure call to login is resolved.
    $rootScope.$apply();

    expect(userService.userLoggedIn()).to.equal(true);
  });

  it('If login is invalid, user should not be logged in', function () {
    proxyResolve = true;
    proxyReturn = false;

    // Login. Data is of no importance since we are mocking proxyService.
    userService.login('123', '123');

    // Make sure call to login is resolved.
    $rootScope.$apply();

    expect(userService.userLoggedIn()).to.equal(false);
  });

  it('If login throws an error, user should not be logged in', function () {
    proxyResolve = false;
    proxyReturn = false;

    // Login. Data is of no importance since we are mocking proxyService.
    userService.login('123', '123');

    // Make sure call to login is resolved.
    $rootScope.$apply();

    expect(userService.userLoggedIn()).to.equal(false);
  });

  it('If logged in, logout should log the user out.', function () {
    proxyResolve = true;
    proxyReturn = true;
    userService.login('123', '123');
    $rootScope.$apply();

    userService.logout();

    expect(userService.userLoggedIn()).to.equal(false);
  });
});