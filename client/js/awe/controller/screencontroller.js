/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Controller = (function(module) {
          
  module.createViewController = function(view) {
    
    var _view = view;
    
    that = {};
    
    that.view = function() { return view; };
    that.setView = function(view) { _view = view; };
    
    that.runloop = function() {
      view.render();
    };
    
    return that;
    
  };
    
  return module;
    
}(AWE.Controller || {}));



