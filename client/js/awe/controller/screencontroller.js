/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createScreenController = function(anchor) {
    
    var _domAnchor = $(anchor);
    var _domRootElement = $('<div class="screen-controller"></div>');
    
    var that = {};
    
    that.anchor = function() {
      return _domAnchor;
    };
    
    that.rootElement = function() {
      return _domRootElement;
    };
    
    that.init = function() {
    };
    
    that.append = function() {
      if (_domRootElement) {
        _domAnchor.append(_domRootElement);
      }
    };
    
    that.remove = function() {
      if (_domRootElement) {
        _domRootElement.remove();
      }
    };
        
    that.runloop = function() {
    };
    
    return that;
    
  };

    
    
  return module;
    
}(AWE.Controller || {}));



