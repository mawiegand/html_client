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

    var _subviews = Array();
    
    
    // protected attributes and methods //////////////////////////////////////

    my = my || {};
    my.container = null;


    // public attributes and methods /////////////////////////////////////////
    
    that = module.createView2(spec, my);
    
    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
    };
    
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      my.container = new Container();
      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
    };
    
    
    that.addChild = function(view) { 
      _subviews.push(view);
      AWE.Ext.applyFunction(view.displayObject(), function(obj){
        my.container.addChild(obj);
      });
    };
    
    that.removeChild = function(view) {
      var index = _subviews.indexOf(view);     
      if (index >= 0) {
        AWE.Ext.applyFunction(view.displayObject(), function(obj){
          my.container.removeChild(obj);
        });
        _subviews.splice(index,1);
      }
    }
    
    that.layoutSubviews = function() {
      _super.layoutSubviews();
      AWE.Ext.applyFunction(_subviews, function(obj) {
        obj.layoutIfNeeded();
      });
    }
    
    that.displayObject = function() { return my.container; }

    
    return that;
  };
  

    
  return module;
    
}(AWE.UI || {}));




