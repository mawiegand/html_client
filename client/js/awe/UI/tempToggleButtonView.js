/* Author: Patrick Fox <patrick@5dlab.com>
 *         Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createTempToggleButtonView = function(spec, my) {

    var that;
    
    var worldMap = false;

    my = my || {};

    my.toggleButtonView = null;

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    that.recalcView = function() {
      
      if (!my.toggleButtonView) {
        my.toggleButtonView = AWE.UI.createButtonView();
        my.toggleButtonView.initWithControllerTextAndImage(my.controller, 'World', AWE.UI.ImageCache.getImage("map/button1"));
        my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        my.toggleButtonView.setFrame(AWE.Geometry.createRect(0, 0, 48, 48));
        my.toggleButtonView.onClick = function() {
          that.onToggleButtonClick()
        };
        this.addChild(my.toggleButtonView);
      }
      
      my.toggleButtonView.setText(worldMap ? 'Game' : 'World');
    }
    
    that.onToggleButtonClick = function() {
      my.controller.switchMapMode(worldMap);
      worldMap = !worldMap;
      this.recalcView() 
    }
    
    that.updateView = function() {
      this.recalcView() 
      _super.updateView();
    };   
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));









