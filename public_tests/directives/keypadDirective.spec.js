describe('keypadDirective', function() {
  var $compile,
    $rootScope, $injector, $document;


  // Load the myApp module, which contains the directive
  beforeEach(module('BibBox'));

  beforeEach(module("my.templates"));

  // Store references to $rootScope and $compile
  // so they are available to all tests in this describe block
  beforeEach(inject(function(_$compile_, _$rootScope_, _$injector_, _$document_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $injector = _$injector_;
    $document = _$document_;
  }));

  it('Checks that the template contains the relevant buttons', function() {
    // Compile a piece of HTML containing the directive
    var element = $compile("<keypad field='test'></keypad>")($rootScope);

    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    // Check that the compiled element contains the templated content
    expect(element.html()).to.contain("numpad.one");
    expect(element.html()).to.contain("numpad.two");
    expect(element.html()).to.contain("numpad.three");
    expect(element.html()).to.contain("numpad.four");
    expect(element.html()).to.contain("numpad.five");
    expect(element.html()).to.contain("numpad.six");
    expect(element.html()).to.contain("numpad.seven");
    expect(element.html()).to.contain("numpad.eight");
    expect(element.html()).to.contain("numpad.nine");
    expect(element.html()).to.contain("numpad.zero");
    expect(element.html()).to.contain("numpad.back");
    expect(element.html()).to.contain("numpad.enter");
  });

  it('Checks that the buttons can be clicked', function() {
    $rootScope.test = '123';
    $rootScope.testFunction = function () {
      $rootScope.test = 'enter-test';
    };

    // Compile a piece of HTML containing the directive
    var el1 = $compile("<keypad field='test' enter='testFunction()'></keypad>")($rootScope);

    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    el1.find('.js-numpad-0').click();
    el1.find('.js-numpad-1').click();
    el1.find('.js-numpad-2').click();
    el1.find('.js-numpad-3').click();
    el1.find('.js-numpad-4').click();
    el1.find('.js-numpad-5').click();
    el1.find('.js-numpad-6').click();
    el1.find('.js-numpad-7').click();
    el1.find('.js-numpad-8').click();
    el1.find('.js-numpad-9').click();

    expect($rootScope.test).to.equal('1230123456789');

    el1.find('.numpad-back').click();

    expect($rootScope.test).to.equal('123012345678');

    el1.find('.numpad-enter').click();

    expect($rootScope.test).to.equal('enter-test');
  });

  it('Should react to key presses between 0-9, and enter and backspace', function () {
    $rootScope.test = '123';
    $rootScope.testFunction = function () {
      $rootScope.test = 'enter-test';
    };

    // Compile a piece of HTML containing the directive
    var el1 = $compile("<keypad field='test' enter='testFunction()'></keypad>")($rootScope);

    // fire all the watches, so the scope expression {{1 + 1}} will be evaluated
    $rootScope.$digest();

    // Should be ignored
    $document.triggerHandler({type : "keydown", which: 47});
    expect($rootScope.test).to.equal('123');

    var res = '123';

    // 0-9
    for (var i = 0; i <= 9; i++) {
      $document.triggerHandler({type : "keydown", which: 48 + i});
      res = res + i;

      expect($rootScope.test).to.equal(res);
    }

    // Backspace
    $document.triggerHandler({type : "keydown", which: 8});
    expect($rootScope.test).to.equal('123012345678');

    // Enter
    $document.triggerHandler({type : "keydown", which: 13});
    expect($rootScope.test).to.equal('enter-test');
  });
});