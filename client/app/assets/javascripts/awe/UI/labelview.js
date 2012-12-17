/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createLabelView = function(spec, my) {
        
    var _container = null;
    var _labelText = null;
    var _labelIcon = null;
    var _backgroundShape = null;
    
    var placeholderShape = null;

    var _background = false;
    var _padding = 0;
    
    my = my || {};
        
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setVisible: AWE.Ext.superior(that, "setVisible"),
    }
    
    that.initWithControllerAndLabel = function(controller, label, background, frame) {
      
      _super.initWithController(controller, frame);
      
      _container = new Container();
      _background = background;
      
      _padding = _background ? 5 : 0;
      
      _labelText = new Text(label, "12px Arial", "#FFF");
      _labelText.textAlign = "center";
      _labelText.textBaseline = "middle";
      
      _labelText.onClick = function() { 
        if (that.onClick) that.onClick();   
      };
      _labelText.onMouseOver = function() {
        if (that.onMouseOver) that.onMouseOver();
      };
      _labelText.onMouseOut = function() {
        if (that.onMouseOut) that.onMouseOut();
      };      
      _container.addChild(_labelText);
    }

    that.setFrame = function(frame) {

      _super.setFrame(frame);
      
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;

      that.layoutSubviews();      
    }
    
    that.layoutSubviews = function() {
      _super.layoutSubviews();
      
      var iconWidth = _labelIcon ? 24 : 0;

      var rectX;
      if (_labelText.textAlign === 'center') {
        rectX = (my.frame.size.width - _labelText.getMeasuredWidth() - iconWidth - 2 * _padding) / 2;
        _labelText.x = (my.frame.size.width + iconWidth) / 2;
        _labelText.y = my.frame.size.height / 2;
        if (_labelIcon) _labelIcon.setOrigin(AWE.Geometry.createPoint((my.frame.size.width - _labelText.getMeasuredWidth() - iconWidth) / 2, my.frame.size.height / 2 - 10));
      }
      else if (_labelText.textAlign === 'right') {
        rectX = my.frame.size.width - _labelText.getMeasuredWidth() - iconWidth - 2 * _padding;
        _labelText.x = my.frame.size.width - _padding;
        _labelText.y = my.frame.size.height / 2;
        if (_labelIcon) _labelIcon.setOrigin(AWE.Geometry.createPoint(my.frame.size.width - _labelText.getMeasuredWidth() - iconWidth - _padding, my.frame.size.height / 2- 10));
      }
      else {
        rectX = 0;
        _labelText.x = _padding + iconWidth;
        _labelText.y = my.frame.size.height / 2;
        if (_labelIcon) _labelIcon.setOrigin(AWE.Geometry.createPoint(_padding, my.frame.size.height / 2 - 10));
      }
            
      if (_background !== false) {
        if (_backgroundShape) {
          _container.removeChild(_backgroundShape);
        }
        
        var _backgroundGraphics = new Graphics();
        _backgroundGraphics.setStrokeStyle(0);
        if (_background === true) {
          _backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
        }
        else {
          _backgroundGraphics.beginFill(_background);
        }
        _backgroundGraphics.drawRoundRect(rectX, (my.frame.size.height - _labelText.getMeasuredLineHeight() - 2 * _padding) / 2, _labelText.getMeasuredWidth() + 2 * _padding + iconWidth, _labelText.getMeasuredLineHeight() + 2 * _padding, 4);
        _backgroundShape = new Shape(_backgroundGraphics);


        _backgroundShape.onClick = function() { 
          if (that.onClick) that.onClick();   
        };
        _backgroundShape.onMouseOver = function() {
          if (that.onMouseOver) that.onMouseOver();
        };
        _backgroundShape.onMouseOut = function() {
          if (that.onMouseOut) that.onMouseOut();
        };        

        _container.addChildAt(_backgroundShape, 0);
      }
      _container.alpha = this.alpha();
    }
    
    that.displayObject = function() {
      return _container;
    }
    
    that.setText = function(text) {
      _labelText.text = text;
      that.setNeedsLayout();     
    }
            
    that.text = function() {
      return _labelText.text;
    }
    
    that.setTextAlign = function(alignment) {
      _labelText.textAlign = alignment;
      that.setNeedsLayout();     
    }
            
    that.textAlign = function() {
      return _labelText.textAlign;
    }
            
    that.setFont = function(font) {
      _labelText.font = font;
      that.setNeedsLayout();
    }
    
    that.font = function() {
      return _labelText.font;
    }
            
    that.setPadding = function(padding) {
      _padding = padding;
      that.setNeedsLayout();     
    }
            
    that.padding = function() {
      return _padding;
    }
    
    that.setColor = function(color) {
      _labelText.color = color;
      that.setNeedsLayout();      
    }
    
    that.setBackground = function(background) {
      _background = background;
      that.setNeedsLayout();      
    }
    
    that.setIconImage = function(image) {
    
      if (!_labelIcon) {
        _labelIcon = AWE.UI.createImageView();
        _labelIcon.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(image));
        _labelIcon.setContentMode(module.ViewContentModeNone);
        _labelIcon.setFrame(AWE.Geometry.createRect(0, 0, 20, 20));

        _labelIcon.onClick = function() { 
          if (that.onClick) that.onClick();   
        };
        _labelIcon.onMouseOver = function() {
          if (that.onMouseOver) that.onMouseOver();
        };
        _labelIcon.onMouseOut = function() {
          if (that.onMouseOut) that.onMouseOut();
        };
        _container.addChild(_labelIcon.displayObject());
      }
      else {
        _labelIcon.setImage(AWE.UI.ImageCache.getImage(image));
      }
      that.setNeedsDisplay();
    }
            
    that.iconImage = function() {
      return _padding;
    };

    return that;
  };
    
  return module;
    
}(AWE.UI || {}));






