/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
    
  module.createContainer = function () {

    var _container = null;
    var _subviews = Array();
    
    var that = module.createView2();
    var _super = {
      initWithController: that.initWithController,
    };
    that.superLayoutSubviews = that.layoutSubviews;
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;
    };
    
    
    that.addChild = function(view) { 
      _subviews.push(view);
      AWE.Ext.applyFunction(view.displayObject(), function(obj){
        _container.addChild(obj);
      });
    };
    
    that.removeChild = function(view) {
      var index = _subviews.indexOf(view);     
      if (index >= 0) {
        AWE.Ext.applyFunction(view.displayObject(), function(obj){
          _container.removeChild(obj);
        });
        _subviews.splice(index,1);
      }
    }
    
    that.layoutSubviews = function() {
      that.superLayoutSubviews();
      AWE.Ext.applyFunction(_subviews, function(obj) {
        obj.layoutIfNeeded();
      });
    }
    
    that.displayObject = function() { return _container; }

    
    return that;
  };
  

    
  return module;
    
}(AWE.UI || {}));




