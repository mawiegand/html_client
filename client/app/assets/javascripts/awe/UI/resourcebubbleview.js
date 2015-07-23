/* Author: Patrick Fox <patrick@5dlab.com>, Jona Boeddinghaus <jona@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.createResourceBubbleView = function(spec, my) {
        
    my = my || {};
    
    my.typeName = "ResourceBubbleView";

    my.resourceImageView    = null;
    my.amountProgressView   = null;    
    
    my.amount   = null;
    my.capacity = null;
    
    my.resourceName;
    my.colors = null;
        
    my.container = null;
    my.shadowEnabled = true;
        
    var that = module.createView(spec, my);
    
    var _resourceName = "";
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
      updateIfNeeded: AWE.Ext.superior(that, "updateIfNeeded"),
    }
    
    that.onMouseOver = function() { 
      that.setHovered(true);  
    }
    that.onMouseOut =  function() {
      that.setHovered(false); 
    }
    
    that.initWithControllerResourceNameColorsAndFrame = function(controller, resourceName, colors, frame) {
      _super.initWithController(controller, frame);
      
      my.container = new Container();
      
      my.resourceName = 'resource_' + resourceName;
      _resourceName = resourceName;
      my.colors = colors;
      
      this.recalcView();
      
      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
      my.container.width  = my.frame.size.width;
      my.container.height = my.frame.size.height;
    }
    
    that.recalcView = function() {
      if (!my.amountProgressView) {
        my.amountProgressView = AWE.UI.createResourceBarView();
        my.amountProgressView.initWithControllerColorsAndFrame(
          my.controller, 
          { topColor: my.colors.topColor, bottomColor: my.colors.bottomColor },
          AWE.Geometry.createRect(50, 10, 114, 25)
        );
        my.container.addChild(my.amountProgressView.displayObject());     
        my.amountProgressView.onClick = function() { 
          if (that.enabled()) {
            that.onClick() 
          }
        }
        my.amountProgressView.onMouseOver = function() {
          if (that.onMouseOver) {
            that.onMouseOver();
          }
        }
        my.amountProgressView.onMouseOut = function() {
          if (that.onMouseOut) {
            that.onMouseOut();
          }
        }
      }
      
      if (!my.resourceImageView) {
        my.resourceImageView = AWE.UI.createImageView();
        my.resourceImageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/resourcebars/" + _resourceName + "/item"));
        if (_resourceName === "fur")
        {
          //my.resourceImageView.setFrame(AWE.Geometry.createRect(15, 0, 48, 52));
          my.resourceImageView.setFrame(AWE.Geometry.createRect(22, 0, 39, 42));
        }
        else if (_resourceName === "stone")
        {
          my.resourceImageView.setFrame(AWE.Geometry.createRect(14, 2, 52, 40));
        }
        else if (_resourceName === "cash")
        {
          my.resourceImageView.setFrame(AWE.Geometry.createRect(18, 0, 42, 42));
          my.amountProgressView.setShowProgress(false);
        }
        else if (_resourceName === "wood")
        {
          my.resourceImageView.setFrame(AWE.Geometry.createRect(8, 8, 52, 36));
        }
        my.container.addChild(my.resourceImageView.displayObject());     
        my.resourceImageView.onClick = function() { 
          if (that.enabled()) {
            that.onClick() 
          }
        }
        my.resourceImageView.onMouseOver = function() {
          if (that.onMouseOver) {
            that.onMouseOver();
          }
        }
        my.resourceImageView.onMouseOut = function() {
          if (that.onMouseOut) {
            that.onMouseOut();
          }
        }
      }                                                  
                  
      that.setValues();
    }

    that.setValues = function() {
      var pool = AWE.GS.ResourcePoolManager.getResourcePool();
      if (pool) {
        my.amount = pool.presentAmount(my.resourceName);
        my.capacity = pool.get(my.resourceName + '_capacity');
        
        my.amountProgressView.setAmountWithCapacity(my.amount, my.capacity);
        
        /*
        if (pool.full(my.resourceName)) {
          my.amountProgressView.setColor('rgb(255,0,0)');
        }
        else if (pool.nearlyFull(my.resourceName)) {
          my.amountProgressView.setColor('rgb(255,128,0)');
        }
        else {
          my.amountProgressView.setColor('rgb(255,255,255)');
        }
        */
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
        changed = changed || pool.presentAmount(my.resourceName)     !== my.amount;
        changed = changed || pool.get(my.resourceName + '_capacity') !== my.capacity;        
      }
      
      if (changed) {        
        // log(">> NEED TO UPDATE BUBBLE DUE TO CHANGED RESOURCE PRODUCTION: " + my.resourceName);
        this.setNeedsUpdate();
        my.amountProgressView.setNeedsUpdate();
      }
      
      _super.updateIfNeeded();
    }  
    
    that.resourceName = function() {
      return my.resourceName;
    }
    
    that.displayObject = function() {
      return my.container;
    }
        
    that.onClick = function() {
      log('button on click');
      if (that.enabled()) {
        my.controller.buttonClicked(that);
      }
    };       
        
        
    return that;
  };
    
  return module;
    
}(AWE.UI || {}));






