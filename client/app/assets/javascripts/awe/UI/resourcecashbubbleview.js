/* Author: Jona Boeddinghaus <jona@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.createResourceCashBubbleView = function(spec, my) {
        
    my = my || {};
    
    my.typeName = "ResourceCashBubbleView";

    my.buyCashImageView    = null;
    
    var that = module.createResourceBubbleView(spec, my);
    
    var _super = {
      initWithControllerResourceNameColorsAndFrame: AWE.Ext.superior(that, "initWithControllerResourceNameColorsAndFrame"),
      updateView: AWE.Ext.superior(that, "updateView"),
      recalcView: AWE.Ext.superior(that, "recalcView"),
      displayObject: AWE.Ext.superior(that, "displayObject"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setEnabled: AWE.Ext.superior(that, "setEnabled"),
      setVisible: AWE.Ext.superior(that, "setVisible"),
    }
    
    that.initWithControllerColorsAndFrame = function(controller, colors, frame) {
      _super.initWithControllerResourceNameColorsAndFrame(controller, "cash", colors, frame);
      
      this.recalcView();      
    }
    
    that.recalcView = function() {
      _super.recalcView();
      
      if (!my.buyCashImageView) {
        my.buyCashImageView = AWE.UI.createImageView();
        my.buyCashImageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/button/plus_button"));
        my.buyCashImageView.setFrame(AWE.Geometry.createRect(150, 0, 28, 28));
        my.buyCashImageView.onClick = function() { 
          if (that.enabled()) {            
            //my.controller.buyCreditsClicked();
            that.onClick();
          }
        }        
        
        _super.displayObject().addChild(my.buyCashImageView.displayObject());
      }                  
    }
    
    that.updateView = function() {
      _super.updateView();
      this.recalcView();
    }
    
    that.displayObject = function() {
      return _super.displayObject();
    }                   
        
    return that;
  };
    
  return module;
    
}(AWE.UI || {}));