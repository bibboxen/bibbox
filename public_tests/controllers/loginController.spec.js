describe('loginController', function () {

  var scope;
  var ctrl;
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
          deferred.resolve();

          return deferred.promise;
        };
        this.registerListeners = function () {};
      });
    });

    inject(function ($rootScope, $controller, _$q_) {
      $q = _$q_;
      scope = $rootScope.$new();

      ctrl = $controller('LoginController', {
        $scope: scope
      });
    })
  });

  it('$scope should have a variable user that is an object', function () {
    expect(scope.user).to.be.an('object');
  });
});