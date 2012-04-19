/* Authors: Sascha Lange <sascha@5dlab.com>,
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
    
  module.createMultiLineContainer = function (spec, my) {

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
      var posY = 0;
      AWE.Ext.applyFunction(my.subviews, function(view) {
        if (view.visible()) {
          view.setOrigin(AWE.Geometry.createPoint(view.frame().origin.x, posY));
          posY += view.frame().size.height + my.padding;
        }
      });
      my.frame.size.height = posY;  // -> set directly to NOT trigger another needs layout, this value IS calculated from the present layout operation.
    }

    return that;
  };
  

    
  return module;
    
}(AWE.UI || {}));




