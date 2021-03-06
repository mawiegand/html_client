/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
    
  module.createContainer = function (spec, my) {

    // private attributes and methods ////////////////////////////////////////

    var that;

    // protected attributes and methods //////////////////////////////////////

    my = my || {};
    my.container = null;
    my.subviews = Array();
    
    my.connectEvents = function(child) {
      if (!child.onClick) {
        child.onClick = function(event) { 
          if (that.onClick) {
            that.onClick(event);
          }
        };
      }
      if (!child.onDoubleClick) {
        child.onDoubleClick = function(event) { 
          if (that.onDoubleClick) {
            that.onDoubleClick(event); 
          }
        };
      }
      if (!child.onMouseOver) {
        child.onMouseOver = function(event) { 
          if (that.onMouseOver) {
            that.onMouseOver(event);
          }
        };
      }
      if (!child.onMouseOut) {
        child.onMouseOut = function(event) { 
          if (that.onMouseOut) {
            that.onMouseOut(event);
          }
        };        
      }
    };
    
    // public attributes and methods /////////////////////////////////////////
    
    that = module.createView(spec, my);
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      notifyRedraw: AWE.Ext.superior(that, 'notifyRedraw'),
    };
    
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      my.container = new Container();
      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
      my.container.width = my.frame.size.width;
      my.container.height = my.frame.size.height;
    };
    
    
    that.getNumChildren = function() {
      return my.container.getNumChildren();
    }
    
    that.addChildAt = function(view, pos) { 
      my.subviews.push(view);
      view.setSuperview(this);
      my.connectEvents(view);
      AWE.Ext.applyFunction(view.displayObject(), function(obj){
        my.container.addChildAt(obj, pos);
      });
      if (view.needsDisplay()) this.setNeedsDisplay();
      if (view.needsLayout())  this.setNeedsLayout();
      if (view.needsUpdate())  this.setNeedsUpdate();  
    };
    
    that.addChild = function(view) {
      my.subviews.push(view);
      view.setSuperview(this);
      my.connectEvents(view);
      AWE.Ext.applyFunction(view.displayObject(), function(obj){
        my.container.addChild(obj);
      });
      if (view.needsDisplay()) this.setNeedsDisplay();
      if (view.needsLayout())  this.setNeedsLayout();
      if (view.needsUpdate())  this.setNeedsUpdate();  
    };
    
    that.removeChild = function(view) {
      var index = my.subviews.indexOf(view);     
      if (index >= 0) {
        AWE.Ext.applyFunction(view.displayObject(), function(obj){
          my.container.removeChild(obj);
        });
        my.subviews.splice(index,1);
        view.setSuperview(null);
      }
    }
    
    that.notifyRedraw = function() { 
      _super.notifyRedraw(); 
      AWE.Ext.applyFunction(my.subviews, function(obj) {
        obj.notifyRedraw();
      });
    }

    
    that.layoutSubviews = function() {
    //log('container needs layout');
    //_super.layoutSubviews();
      AWE.Ext.applyFunction(my.subviews, function(obj) {
        obj.layoutIfNeeded();
      });
    }
    
    that.updateView = function() {
    // log('container needs update');
    //_super.layoutSubviews();
      AWE.Ext.applyFunction(my.subviews, function(obj) {
        obj.updateIfNeeded();
      });
    }
    
    that.displayObject = function() { return my.container; }

    return that;
  };
  

    
  return module;
    
}(AWE.UI || {}));




