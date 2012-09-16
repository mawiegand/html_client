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
    
    my.amount   = null;
    my.rate     = null;
    my.capacity = null;
    
    my.resourceName;
        
    var that = module.createButtonView(spec, my);
    
    var _super = {
      initWithControllerTextAndImage: AWE.Ext.superior(that, "initWithControllerTextAndImage"),
      updateView:                     AWE.Ext.superior(that, "updateView"),
      updateIfNeeded:                 AWE.Ext.superior(that, "updateIfNeeded"),
    }
    
    that.initWithControllerAndResourceImage = function(controller, imageName, resourceName, frame) {
      _super.initWithControllerTextAndImage(controller, "",
                                            AWE.UI.ImageCache.getImage("hud/bubble/normal"),
                                            frame || AWE.Geometry.createRect(0, 0, 244, 51));
      this.setImageForState(AWE.UI.ImageCache.getImage("hud/bubble/hovered"), module.CONTROL_STATE_HOVERED);
      my.resourceImageName = imageName;
      my.resourceName = resourceName;
      
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
        my.container.addChild(my.amountView.displayObject());
      }

      if (!my.rateView) {
        my.rateView = AWE.UI.createLabelView();
        my.rateView.initWithControllerAndLabel(my.controller);
        my.rateView.setTextAlign("right");
        my.rateView.setFont("12px Arial");
        my.rateView.setColor('rgb(120,120,150)');
        my.rateView.setFrame(AWE.Geometry.createRect(150, 13, 58, 20));      
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
        my.container.addChild(my.capacityView.displayObject());
      }
      that.setValues();
    }

    that.setValues = function() {
      var pool = AWE.GS.ResourcePoolManager.getResourcePool();
      if (pool) {
        my.amount = pool.presentAmount(my.resourceName);
        my.rate = Math.floor(pool.get(my.resourceName+'_production_rate'));
        my.capacity = pool.get(my.resourceName+'_capacity');
        
        my.amountView.setText(""+my.amount);
        my.rateView.setText("+"+my.rate+"/h");
        my.capacityView.setText(""+Math.floor(my.capacity));
      }
    }
    
    that.updateView = function() {
      _super.updateView();
      this.recalcView();
    }
    
    /** checks for itself whether the view needs an update (changed reosources) or not. */
    that.updateIfNeeded = function() {
      var changed = false;
      var pool = AWE.GS.ResourcePoolManager.getResourcePool();
      if (pool) {
        changed = changed || pool.presentAmount(my.resourceName)                      !== my.amount;
        changed = changed || Math.floor(pool.get(my.resourceName+'_production_rate')) !== my.rate;
        changed = changed || pool.get(my.resourceName+'_capacity')                    !== my.capacity;
      }
      
      if (changed) {
        console.log(">> NEED TO UPDATE BUBBLE DUE TO CHANGED RESOURCE PRODUCTION: " + my.resourceName);
        this.setNeedsUpdate();
      }
      _super.updateIfNeeded();
    }    
        
    that.onClick = function() {
    };        
        
    return that;
  };
    
  return module;
    
}(AWE.UI || {}));






