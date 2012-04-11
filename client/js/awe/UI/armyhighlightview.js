/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createArmyHighlightView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = "ArmyHighlightView";
        
    var _army = null;    
    var _container = null;
    
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
    }
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      _army = army;
      
      _container = new Container();
      
      that.layoutSubviews();  
    }
    
    that.updateView = function() {
      that.setNeedsLayout();
    }

    that.army = function() { return _army; }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;
    }
    
    that.displayObject = function() {
      return _container;
    }
    
    that.army = function() {
      return _army;
    }
            
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));




