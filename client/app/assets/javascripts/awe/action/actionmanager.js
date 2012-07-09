/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Action = (function(module) {
  
  module.PRIORITY_STANDARD = 0;
  module.PRIORITY_HIGH = 1;
  
  /** action manager that queues and sends actions. Presently offers one
   * queue and the most simple control logic. May be later extended to more
   * parallel lines, if connections are available. */
  module.Manager = (function(my) {
    
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    my.queue = [];
    my.processing = null;

    
    // public attributes and methods ///////////////////////////////////////
    
    that = {};      
    
    that.queueAction = function(action, callback, priority) {
      if (priority === module.PRIORITY_HIGH) {
        my.queue.unshift({action: action, callback: callback, timeAdded: new Date()});
      }
      else {
        my.queue.push({action: action, callback: callback, timeAdded: new Date()});
      }
      if (!my.processing) {
        this.processNextAction();
      }
    };
    
    that.processNextAction = function() {
      if (my.processing) {
        console.log("ERROR: action manager should process next action while it's still processing.");
        return ; // already processing
      }
      if (my.queue.length == 0) {
        return ; // nothing to process
      }
      my.processing = my.queue.shift();
      my.processing.action.send((function(action, callback) {
        return function(statusCode, jqXHR) {
          my.processing = null;
          that.processNextAction()
          if (callback) {
            callback(statusCode, jqXHR);
          }
        }
      })(my.processing.action, my.processing.callback));
    };
    
    that.dequeueAction = function(action) {
      
    };
    
    that.queueLength = function() {
      return my.queue.length;
    }
    
    return that;
  })();
  
  
  return module;
  
}(AWE.Action || {}));