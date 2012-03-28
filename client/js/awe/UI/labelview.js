/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createLabelView = function(spec, my) {
        
    var _container = null;
    
    my = my || {};
        
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    }
    
    that.initWithControllerAndLabel = function(controller, label, background, frame) {
      _super.initWithController(controller, frame);
      
      _container = new Container();      

      var _ownerNameText = new Text(label, "12px Arial", "#FFF");
      _ownerNameText.textAlign = "center";
      _ownerNameText.textBaseline = "middle";
      _ownerNameText.x = 0;
      _ownerNameText.y = (_ownerNameText.getMeasuredLineHeight() + 10) / 2;
      _container.addChild(_ownerNameText);
    
      if (background) {
        var _ownerNameGraphics = new Graphics();
        _ownerNameGraphics.setStrokeStyle(0);
        _ownerNameGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
        _ownerNameGraphics.drawRoundRect(-(_ownerNameText.getMeasuredWidth() + 10) / 2, 0, _ownerNameText.getMeasuredWidth() + 10, _ownerNameText.getMeasuredLineHeight() + 10, 3);
        var _ownerNameShape = new Shape(_ownerNameGraphics);
        _container.addChild(_ownerNameShape);
      }
      
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
      
      _container.addChild(_ownerNameText);
    }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;
    }
    
    that.layoutSubviews = function() {      
      _needsLayout = true;
      _needsDisplay = true;
    }
    
    that.displayObject = function() {
      return _container;
    }
            
    return that;
  };
    
  return module;
    
}(AWE.UI || {}));






