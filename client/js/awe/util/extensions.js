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
  
  
  Date.parseISODate = function(s){
    var re=new RegExp(/(\d\d\d\d)\D?(\d\d)\D?(\d\d)\D?(\d\d)\D?(\d\d\D?(\d\d\.?(\d*))?)(Z|[+-]\d\d?(:\d\d)?)?/);
    var a=s.match(re).slice(1).map(function(x,i){
      if (i==6 && x) x=parseInt(x,10)/Math.pow(10,x.length)*1000; // convert to milliseconds
      return parseInt(x,10)||0;
    });
    return new Date(
      Date.UTC(a[0],a[1]-1,a[2],a[3]-(a[7]||0),a[4],a[5],a[6])
    );
  };
  

/*  Date.prototype.setISO8601 = function(dString){

    var regexp = /(\d\d\d\d)(-)?(\d\d)(-)?(\d\d)(T)?(\d\d)(:)?(\d\d)(:)?(\d\d)(\.\d+)?(Z|([+-])(\d\d)(:)?(\d\d))/;

    if (dString.toString().match(new RegExp(regexp))) {
      var d = dString.match(new RegExp(regexp));
      var offset = 0;

      this.setUTCDate(1);
      this.setUTCFullYear(parseInt(d[1],10));
      this.setUTCMonth(parseInt(d[3],10) - 1);
      this.setUTCDate(parseInt(d[5],10));
      this.setUTCHours(parseInt(d[7],10));
      this.setUTCMinutes(parseInt(d[9],10));
      this.setUTCSeconds(parseInt(d[11],10));
      if (d[12])
      this.setUTCMilliseconds(parseFloat(d[12]) * 1000);
      else
      this.setUTCMilliseconds(0);
      if (d[13] != 'Z') {
        offset = (d[15] * 60) + parseInt(d[17],10);
        offset *= ((d[14] == '-') ? -1 : 1);
        this.setTime(this.getTime() - offset * 60 * 1000);
      }
    }
    else {
      this.setTime(Date.parse(dString));
    }
    return this;
  };*/


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
  
  /** calls the function for each of the elements of the hash. */
  module.applyFunctionToHash = function(_hash, _function) {
    for (var key in _hash) {
      if (_hash.hasOwnProperty(key)) {
        _function(key, _hash[key]);
      }
    }
  }  
  
  module.hashValues = function(_hash) {
    var values = [];
    module.applyFunctionToElements(_hash, function(value) { values.push(value); } );
    return values;
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
  