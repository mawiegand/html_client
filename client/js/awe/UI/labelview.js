/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createLabelView = function(spec, my) {
        
    var _container = null;
    var _labelText = null;
    var _backgroundShape = null;
    
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
      _background = background;      

      _labelText = new Text(label, "12px Arial", "#FFF");
      _labelText.textAlign = "center";
      _labelText.textBaseline = "middle";
      _labelText.x = my.frame.size.width / 2;
      _labelText.y = my.frame.size.height / 2;
      _container.addChild(_labelText);
    
      if (background) {
        var _backgroundGraphics = new Graphics();
        _backgroundGraphics.setStrokeStyle(0);
        _backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
        _backgroundGraphics.drawRoundRect((my.frame.size.width - _labelText.getMeasuredWidth() - 10) / 2, (my.frame.size.height - _labelText.getMeasuredLineHeight() - 8) / 2, _labelText.getMeasuredWidth() + 10, _labelText.getMeasuredLineHeight() + 8, 4);
        _backgroundShape = new Shape(_backgroundGraphics);
        _container.addChild(_backgroundShape);
      }
      
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;

      _labelText.x = my.frame.size.width / 2;
      _labelText.y = my.frame.size.height / 2;

      if (_backgroundShape) {
        _container.removeChild(_backgroundShape);
        var _backgroundGraphics = new Graphics();
        _backgroundGraphics.setStrokeStyle(0);
        _backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
        _backgroundGraphics.drawRoundRect((frame.size.width - _labelText.getMeasuredWidth() - 10) / 2, (frame.size.height - _labelText.getMeasuredLineHeight() - 8) / 2, _labelText.getMeasuredWidth() + 10, _labelText.getMeasuredLineHeight() + 8, 4);
        _backgroundShape = new Shape(_backgroundGraphics);
        _container.addChildAt(_backgroundShape, 0);
      }
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






