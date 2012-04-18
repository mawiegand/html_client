/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createSettlementView = function(spec, my) {
    
    var that;
        
    my = my || {};
    
    my.container = null;    
    my.annotationView = null;
    my.targetView = null;

    that = module.createView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setAlpha: AWE.Ext.superior(that, "setAlpha"),
    };
    
    /** overwritten view methods */
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      my.container = new Container();
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
  /*    my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;*/
    }
    
    that.setAlpha = function(alpha) {
      _super.setAlpha(alpha);
      my.container.visible = alpha !== 0;
      my.container.alpha = alpha;
    }
            
    that.displayObject = function() {
      return my.container;
    };
    
    that.setAnnotationView = function(annotationView) {
      my.annotationView = annotationView;
    }
    
    that.annotationView = function() {
      return my.annotationView;
    }
    
    that.setTargetView = function(annotationView) {
      my.targetView = annotationView;
    }
    
    that.targetView = function() {
      return my.targetView;
    }
    
    that.onClick = function() {
      my.controller.viewClicked(that);
    };
    
    that.onMouseOver = function(evt){
      my.controller.viewMouseOver(that);
    };

    that.onMouseOut = function(evt){
      my.controller.viewMouseOut(that);
    };
    
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



