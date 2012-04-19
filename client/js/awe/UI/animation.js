/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createAnimation = function(spec, my) {
    
    var that;

    my = my || {};
    
    my.animating = true;
    my.view = spec.view || null;
    
    that = {};
    
    that.onAnimationEnd = spec.onAnimationEnd || null;
    
    that.animating = function() {
      return my.animating;
    }
    
    that.ended = function() {
      return !my.animating;
    }
    
    that.cancel = function() {
      my.animating = false;
    }
    
    that.update = function() {
      if (!my.animating && this.onAnimationEnd) {
        this.onAnimationEnd();
      }
    }
    
    return that;
  };
  
  
  
  module.createTimedAnimation = function(spec, my) {
    
    var that;

    my = my || {};
    
    my.started = null;
    my.frameCount = 0;
    
    that = module.createAnimation(spec, my);
    
    var _super = {
      update: AWE.Ext.superior(that, "update"),
    }
    
    that.duration = spec.duration || 1000;             ///< duration in ms. default: 1000ms=1s.
    that.updateView = spec.updateView || null; ///< function that does the update on the view.

    that.update = function() {
      if (!my.started) {
        my.started = new Date().getTime();
      }
      var elapsed = new Date().getTime() - my.started;
      var progress = elapsed*1.0/that.duration;
      
      if (progress >= 1.0) {
        my.animating = false;
        progress = 1.0;
      }
      
      if (this.updateView && my.animating) {
        this.updateView(my.view, progress, my.frameCount);
      }
      my.frameCount++;
      
      _super.update();
    }
    
    return that;
  }; 
  
   
  
  return module;
  
}(AWE.UI || {}));