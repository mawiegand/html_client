/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createScreenController = function(anchor) {
    
    var _domElement = $(anchor);
    
    var that = {};
    
    that.anchor = function() {
      return _domElement;
    };
    
    that.init = function() {
    };
        
    that.runloop = function() {
    };
    
    return that;
    
  };

    
    
  return module;
    
}(AWE.Controller || {}));



