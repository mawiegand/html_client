/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.createResourceBubbleView = function(spec, my) {
        
    my = my || {};
    
    my.typeName = "ResourceBubbleView";
    my.resourceImageName;

    my.resourceImageView = null;
    my.amountView        = null;
    my.rateView          = null;
    my.capacityView      = null;
    my.capacityLabelView = null;
        
    var that = module.createButtonView(spec, my);
    
    var _super = {
      initWithControllerTextAndImage: AWE.Ext.superior(that, "initWithControllerTextAndImage"),
      updateView:                     AWE.Ext.superior(that, "updateView"),
    }
    
    that.initWithControllerAndResourceImage = function(controller, imageName, frame) {
      _super.initWithControllerTextAndImage(controller, "",
                                            AWE.UI.ImageCache.getImage("hud/bubble/normal"),
                                            frame || AWE.Geometry.createRect(0, 0, 244, 51));
      this.setImageForState(AWE.UI.ImageCache.getImage("hud/bubble/hovered"), module.CONTROL_STATE_HOVERED);
      my.resourceImageName = imageName;
      
      this.recalcView();
    }
    
    that.recalcView = function() {
      if (!my.resourceImageView) {
        my.resourceImageView = AWE.UI.createImageView();
        my.resourceImageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(my.resourceImageName));
        my.resourceImageView.setFrame(AWE.Geometry.createRect(22, 8, 36, 36));
        my.container.addChild(my.resourceImageView.displayObject());     
      } 

      if (!my.amountView) {
        my.amountView = AWE.UI.createLabelView();
        my.amountView.initWithControllerAndLabel(my.controller);
        my.amountView.setTextAlign("left");
        my.amountView.setFont("16px Arial");
        my.amountView.setColor('rgb(80,80,80)');
        my.amountView.setFrame(AWE.Geometry.createRect(78, 10, 80, 24));      
        my.amountView.setText('1,123,293');
        my.container.addChild(my.amountView.displayObject());
      }

      if (!my.rateView) {
        my.rateView = AWE.UI.createLabelView();
        my.rateView.initWithControllerAndLabel(my.controller);
        my.rateView.setTextAlign("right");
        my.rateView.setFont("12px Arial");
        my.rateView.setColor('rgb(120,120,150)');
        my.rateView.setFrame(AWE.Geometry.createRect(150, 13, 58, 20));      
        my.rateView.setText('+10,123/h');
        my.container.addChild(my.rateView.displayObject());
      }

      if (!my.capacityLabelView) {
        my.capacityLabelView = AWE.UI.createLabelView();
        my.capacityLabelView.initWithControllerAndLabel(my.controller);
        my.capacityLabelView.setTextAlign("left");
        my.capacityLabelView.setFont("12px Arial");
        my.capacityLabelView.setColor('rgb(120,120,150)');
        my.capacityLabelView.setFrame(AWE.Geometry.createRect(78, 28, 40, 20));      
        my.capacityLabelView.setText('MAX:');
        my.container.addChild(my.capacityLabelView.displayObject());
      }

      if (!my.capacityView) {
        my.capacityView = AWE.UI.createLabelView();
        my.capacityView.initWithControllerAndLabel(my.controller);
        my.capacityView.setTextAlign("left");
        my.capacityView.setFont("12px Arial");
        my.capacityView.setColor('rgb(120,120,150)');
        my.capacityView.setFrame(AWE.Geometry.createRect(118, 28, 100, 20));      
        my.capacityView.setText('4,000,000');
        my.container.addChild(my.capacityView.displayObject());
      }
    }
    
    that.updateView = function() {
      _super.updateView();
      this.recalcView();
    }
        
    that.onClick = function() {
      log('resource bubble clicked');
    };        
        
    return that;
  };
    
  return module;
    
}(AWE.UI || {}));






