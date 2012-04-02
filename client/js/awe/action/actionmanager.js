/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Action = (function(module) {
  
  module.PRIORITY_STANDARD = 0;
  module.PRIORITY_HIGH = 1;
  
  
  module.Manager = (function(my) {
    
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = {};      
    
    that.queueAction = function(action, callback, priority) {
      
    };
    
    that.dequeueAction = function(action) {
      
    };
    
    
    
    return that;
  })();
  
  
  return module;
  
}(AWE.Action || {}));