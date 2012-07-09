/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.createButtonView = function(spec, my) {
        
    var _container = null;
    var _labelText = null;
    var _imageView = null;
    
    var imagesForStates = {}; 
        
    my = my || {};
    
    my.typeName = "ButtonView";
        
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
      
      _container = new Container();
      
      imagesForStates[module.CONTROL_STATE_NORMAL] = image;

      _imageView = AWE.UI.createImageView();
      _imageView.initWithControllerAndImage(controller, image);
      _imageView.setContentMode(module.ViewContentModeNone);
      _imageView.onClick = function() { 
        if (that.enabled()) {
          that.onClick() 
        }
      }; // CAUTION: need to wrap the call in a function, because otherwise it's not possible to attach a different function to that as onClick handler
      _imageView.onMouseOver = function(self) { return function() { self.setHovered(true); if (controller) controller.setNeedsDisplay(); }}(this);
      _imageView.onMouseOut = function(self) { return function() { self.setHovered(false); if (controller) controller.setNeedsDisplay(); }}(this);
      _container.addChild(_imageView.displayObject());
      
      _labelText = new Text(text, "10px Arial", "#FFF");
      _labelText.textAlign = "center";
      _labelText.textBaseline = "middle";
      _labelText.x = my.frame.size.width / 2;
      _labelText.y = my.frame.size.height / 2;
      _labelText.view = that;
      _labelText.onMouseOver = function(self) { return function() { self.setHovered(true); if (controller) controller.setNeedsDisplay(); }}(this);
      _labelText.onMouseOut = function(self) { return function() { self.setHovered(false); if (controller) controller.setNeedsDisplay(); }}(this);
      _container.addChild(_labelText);
    
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
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
      
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;

      _labelText.x = frame.size.width / 2;
      _labelText.y = frame.size.height / 2;
      
      _imageView.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
    }
    
    that.displayObject = function() {
      return _container;
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
      _labelText.text = text;
      this.setNeedsUpdate();
    }
    
    that.text = function() {
      return _labelText.text;
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






