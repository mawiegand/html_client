/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.createButtonView = function(spec, my) {
        
    var _labelText = null;
    var _labelText2 = null;
    var _imageView = null;
    
    var imagesForStates = {}; 
        
    my = my || {};
    
    my.typeName = "ButtonView";
    my.container = null;
        
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setEnabled: AWE.Ext.superior(that, "setEnabled"),
      setVisible: AWE.Ext.superior(that, "setVisible"),
    }
    
    that.initWithControllerTextAndImage = function(controller, text, image, frame) {
      _super.initWithController(controller, frame);
      
      my.container = new Container();
      
      imagesForStates[module.CONTROL_STATE_NORMAL] = image;

      _imageView = AWE.UI.createImageView();
      _imageView.initWithControllerAndImage(controller, image);
      _imageView.setContentMode(module.ViewContentModeNone);
      _imageView.onClick = function() { 
        if (that.enabled()) {
          that.onClick() 
        }
      }; // CAUTION: need to wrap the call in a function, because otherwise it's not possible to attach a different function to that as onClick handler
      _imageView.onDoubleClick = function() { 
        if (that.enabled()) {
          that.onDoubleClick() 
        }
      };
      _imageView.onMouseOver = function(self) { return function() { self.setHovered(true); if (controller) controller.setNeedsDisplay(); }}(this);
      _imageView.onMouseOut = function(self) { return function() { self.setHovered(false); if (controller) controller.setNeedsDisplay(); }}(this);
      my.container.addChild(_imageView.displayObject());
      
      _labelText2 = new Text(text, "10px Arial", "#000");
      _labelText2.textAlign = "center";
      _labelText2.textBaseline = "middle";
      _labelText2.x = my.frame.size.width / 2;
      _labelText2.y = my.frame.size.height / 2;
      _labelText2.view = that;
      _labelText2.onMouseOver = function(self) { return function() { self.setHovered(true); if (controller) controller.setNeedsDisplay(); }}(this);
      _labelText2.onMouseOut = function(self) { return function() { self.setHovered(false); if (controller) controller.setNeedsDisplay(); }}(this);
      my.container.addChild(_labelText2);
    
      _labelText = new Text(text, "10px Arial", "#fff");
      _labelText.textAlign = "center";
      _labelText.textBaseline = "middle";
      _labelText.x = my.frame.size.width / 2;
      _labelText.y = my.frame.size.height / 2;
      _labelText.view = that;
      _labelText.onMouseOver = function(self) { return function() { self.setHovered(true); if (controller) controller.setNeedsDisplay(); }}(this);
      _labelText.onMouseOut = function(self) { return function() { self.setHovered(false); if (controller) controller.setNeedsDisplay(); }}(this);
      my.container.addChild(_labelText);
    
      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
    }
    
    that.updateView = function() {

      _imageView.setAlpha(this.alpha()); // usual case

      if (this.enabled()) {  // make sure, the button has the correct alpha value, if enabled
        _imageView.setAlpha(this.alpha());
      }
      
      if (!this.enabled()) {
        _imageView.setImage(this.imageForState(module.CONTROL_STATE_DISABLED));
        if (!this.hasSpecificImageForState(module.CONTROL_STATE_DISABLED)) {
          _imageView.setAlpha(0.3 * this.alpha());
        }
      }
      else if (this.selected()) {
        _imageView.setImage(this.imageForState(module.CONTROL_STATE_SELECTED));
      }
      else if (this.hovered()) {
        _imageView.setImage(this.imageForState(module.CONTROL_STATE_HOVERED));
      }
      else {
        _imageView.setImage(this.imageForState(module.CONTROL_STATE_NORMAL));
      }
    }
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      
      my.container.x = frame.origin.x;
      my.container.y = frame.origin.y;

      _labelText2.x = frame.size.width / 2 + 1;
      _labelText2.y = frame.size.height / 2 + 1;
      
      _labelText.x = frame.size.width / 2;
      _labelText.y = frame.size.height / 2;
      
      _imageView.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
    }
    
    that.displayObject = function() {
      return my.container;
    }
    
    that.setImageForState = function(image, controlState) {
      imagesForStates[controlState] = image;
      this.setNeedsUpdate();
    }
    
    that.imageForState = function(controlState) {
      if (imagesForStates[controlState] === undefined || imagesForStates[controlState] === null) {
        return imagesForStates[module.CONTROL_STATE_NORMAL];
      }
      else {
        return imagesForStates[controlState];
      }
    }
    
    that.hasSpecificImageForState = function(controlState) {
      return !(imagesForStates[controlState] === undefined || imagesForStates[controlState] === null)
    }
    

    that.setText = function(text) {
      _labelText2.text = text;
      _labelText.text = text;
      this.setNeedsUpdate();
    }
    
    that.text = function() {
      return _labelText.text;
    }
    
    that.setTextPos = function(x, y) {
      if (x != null) {
        _labelText.x = _labelText2.x = x;
      }
      else {
        _labelText2.x = _labelText.x;
      }
      if (y != null) {
        _labelText.y = _labelText2.y = y;
      }
      else {
        _labelText2.y = _labelText.y;
      }
      this.setNeedsUpdate();
    }
    
    that.setColor = function(color) {
      _labelText.color = color;
//      _labelText2.color = color;
      this.setNeedsUpdate();
    }
    
    that.setFont = function(font) {
      _labelText.font = font;
      _labelText2.font = font;
      _labelText2.color = "#000";
      this.setNeedsUpdate();
    }
    
    /* actions */
    
    
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






