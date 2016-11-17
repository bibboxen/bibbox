/**
 * @file
 * Helper class to ensure that interfaces are implemented correctly.
 */

var Interface = function(name, methods) {

  // Check that arguments are present.
  if (arguments.length != 2) {
    throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
  }

  this.name = name;
  this.methods = [];

  // Check that methods are strings.
  for (var i = 0, len = methods.length; i < len; i++) {
    if (typeof methods[i] !== 'string') {
      throw new Error("Interface constructor expects method names to be passed in as a string.");
    }

    this.methods.push(methods[i]);
  }
};

/**
 * Static class method to check implementation.
 */
Interface.ensureImplements = function(object) {
  if (arguments.length < 2) {
    throw new Error("Function Interface.ensureImplements called with " + arguments.length + "arguments, but expected at least 2.");
  }

  for (var i = 1, len = arguments.length; i < len; i++) {
    var iface = arguments[i];
    if (iface.constructor !== Interface) {
      throw new Error("Function Interface.ensureImplements expects arguments two and above to be instances of Interface.");
    }

    for (var j = 0, methodsLen = iface.methods.length; j < methodsLen; j++) {
      var method = iface.methods[j];
      if (!object[method] || typeof object[method] !== 'function') {
        throw new Error("Function Interface.ensureImplements: object does not implement the " + iface.name + " interface. Method " + method + " was not found.");
      }
    }
  }
};