/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** extensions of JavaScript base types. */
AWE.Ext = (function(module) {
  
  /** returns the next absolutely larger integer; that is returns
   * the floor for negative numbers and the ceil for positive numbers. This method
   * is used to enlarge an area with positive or negative coordinates to full integers
   * in such a way that it encloses the original area.
   */
  Number.prototype.extendInteger = function() {
    return Math[(this > 0 ? 'ceil' : 'floor')](this);
  };
  

  Object.prototype.superior = function(name) {
    var that = this, method = that[name];   // store the 'this' for later, when really calling the function "name".
    return function() {
      return method.apply(that, arguments); // make sure to set the 'this' correctly for the super method.
    }
  };
  
  /** check if _obj is an Array
   */
  module.isArray = function(_obj) {
    return _obj && typeof _obj === 'object' && _obj.constructor === Array;
  };
  
  /** if _obj is an array, applyFunction calls _function multiple times with every
   * array member as parameter, else _function will be called once with _obj as parameter
   */
  module.applyFunction = function(_obj, _function) {
    if (module.isArray(_obj)) {
      for (var i=0; i < _obj.length; i++) {
        _function(_obj[i]);
      }
    }
    else if (_obj) {
      _function(_obj);
    }
  }
    
  /** returns a random integer in [0;max[
   */ 
  module.random = function(max) {
    return Math.floor(Math.random() * max);
  };
  
  /** the signum function
   */
  module.sign = function(x) {
    if (x > 0) return 1;
    if (x < 0) return -1;
    return 0;
  };

  return module;
  
}(AWE.Ext || {}));
  