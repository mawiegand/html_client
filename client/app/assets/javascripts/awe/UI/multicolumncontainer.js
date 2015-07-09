/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
    
  module.createMultiColumnContainer = function (spec, my) {

    // private attributes and methods ////////////////////////////////////////

    var that;
    
    
    // protected attributes and methods //////////////////////////////////////

    my = my || {};
    my.padding = 0;

    // public attributes and methods /////////////////////////////////////////
    
    that = module.createContainer(spec, my);
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
    };
    
    that.setPadding = function(padding) { my.padding = padding };
    that.padding = function() { return my.padding; }
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
    };
    
    that.layoutSubviews = function() {
      _super.layoutSubviews();
      this.repositionSubviews();
    };
    
    that.repositionSubviews = function() {
      var posX = 0;
      var height = 0;
      AWE.Ext.applyFunction(my.subviews, function(view) {
        if (view.visible()) {
          view.setOrigin(AWE.Geometry.createPoint(posX, view.frame().origin.y));
          posX += view.frame().size.width + my.padding;
          if(view.frame().size.height > height)
          {
            height = view.frame().size.height;
          }
        }
      });
      my.frame.size.width = posX;  // -> set directly to NOT trigger another needs layout, this value IS calculated from the present layout operation.
      my.frame.size.height = height;
    }

    return that;
  };
  

    
  return module;
    
}(AWE.UI || {}));




