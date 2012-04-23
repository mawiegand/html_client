/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createSettlementView = function(spec, my) {
    
    var that;
        
    my = my || {};
    
    my.typeName = "SettlementView";
    
    my.annotationView = null;
    my.targetView = null;

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setAlpha: AWE.Ext.superior(that, "setAlpha"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
    };
    
    that.updateView = function() {
      if (my.targetView) {
        my.targetView.setHovered(this.hovered());
      }
      _super.updateView();
    }    
    
    that.setAnnotationView = function(annotationView) {
      my.annotationView = annotationView;
    }
    
    that.annotationView = function() {
      return my.annotationView;
    }
    
    that.setTargetView = function(targetView) {
      my.targetView = targetView;
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



