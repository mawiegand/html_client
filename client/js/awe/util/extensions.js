/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** extensions of JavaScript base types. */
AWE.Ext = (function(module) {
  
  module.superior = function(that, name) {
    var method = that[name];              
    return function() {
      return method.apply(that, arguments); // make sure to set the 'this' correctly for the super method.
    }
  };  
  
  /** returns the next absolutely larger integer; that is returns
   * the floor for negative numbers and the ceil for positive numbers. This method
   * is used to enlarge an area with positive or negative coordinates to full integers
   * in such a way that it encloses the original area.
   */
  Number.prototype.extendInteger = function() {
    return Math[(this > 0 ? 'ceil' : 'floor')](this);
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
  
  /** calls the function for each of the elements of the hash. */
  module.applyFunctionToElements = function(_hash, _function) {
    for (var key in _hash) {
      if (_hash.hasOwnProperty(key)) {
        _function(_hash[key]);
      }
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
  
/*  Handlebars.registerHelper('I18n',   // this is a small helper to combine I10n.js with handlebars.
    function(str){ return I18n.t(str); }
  );*/

  return module;
  
}(AWE.Ext || {}));
  