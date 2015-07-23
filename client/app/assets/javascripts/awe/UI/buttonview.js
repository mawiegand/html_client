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

    var isButtonDown = false;
    
    var imagesForStates = {}; 
        
    my = my || {};
    
    my.typeName = "ButtonView";
    my.container = null;
    my.shadowEnabled = true;
        
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setEnabled: AWE.Ext.superior(that, "setEnabled"),
      setVisible: AWE.Ext.superior(that, "setVisible"),
    }
    
    that.onMouseOver = function() { 
      that.setHovered(true);  
    }
    that.onMouseOut =  function() {
      that.setHovered(false); 
    }

    
    that.initWithControllerTextAndImage = function(controller, text, image, frame, font) {
      _super.initWithController(controller, frame);
      
      font = font || "10px Arial";
      
      my.container = new Container();
      
      imagesForStates[module.CONTROL_STATE_NORMAL] = image;

      _imageView = AWE.UI.createImageView();
      _imageView.initWithControllerAndImage(controller, image);
      _imageView.setContentMode(module.ViewContentModeFit);

      _imageView.onMouseDown = function() {
        that.setNeedsUpdate();
        isButtonDown = true;
        that.updateView ();
      };
      _imageView.onMouseUp = function(){
        that.setNeedsUpdate();
        isButtonDown = false;
        that.updateView ();
      };
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
      _imageView.onMouseOver = function(event) { that.onMouseOver(event); }
      _imageView.onMouseOut =  function(event) { that.onMouseOut(event); }
      my.container.addChild(_imageView.displayObject());
      
      _labelText2 = new Text(text, font, "#000");
      _labelText2.textAlign = "center";
      _labelText2.textBaseline = "middle";
      _labelText2.x = my.frame.size.width / 2;
      _labelText2.y = my.frame.size.height / 2;
      _labelText2.view = that;
      _labelText2.onMouseUp = function(){
        that.setNeedsUpdate();
        isButtonDown = false;
        that.updateView ();
      }
      _labelText2.onMouseDown = function(){
        that.setNeedsUpdate();
        isButtonDown = true;
        that.updateView ();
      }
      _labelText2.onMouseOver = function(event) { that.onMouseOver(event); }
      _labelText2.onMouseOut =  function(event) { that.onMouseOut(event); }
      my.container.addChild(_labelText2);
    
      _labelText = new Text(text, font, "#fff");
      _labelText.textAlign = "center";
      _labelText.textBaseline = "middle";
      _labelText.x = my.frame.size.width / 2;
      _labelText.y = my.frame.size.height / 2;
      _labelText.view = that;
      _labelText.onMouseUp = function(){
        that.setNeedsUpdate();
        isButtonDown = false;
        that.updateView ();
      }
       _labelText.onMouseDown = function(){
        that.setNeedsUpdate();
        isButtonDown = true;
        that.updateView ();
      }
      _labelText.onMouseOver = function(event) { that.onMouseOver(event); }
      _labelText.onMouseOut =  function(event) { that.onMouseOut(event); }
      my.container.addChild(_labelText);
    
      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
      my.container.width = my.frame.size.width;
      my.container.height = my.frame.size.height;
    }
    
    that.updateView = function() {

      _imageView.setAlpha(this.alpha()); // usual case

      if (this.enabled()) {  // make sure, the button has the correct alpha value, if enabled
        //_imageView.setAlpha(this.alpha());
        if(isButtonDown){
           _imageView.setAlpha(0.7 * this.alpha());
           _labelText.alpha = 0.7;
           _labelText2.alpha = 0.7;
        }else{
           _imageView.setAlpha(this.alpha());
           _labelText.alpha = 1.0;
           _labelText2.alpha = 1.0;
        }
      }
      
      if (!this.enabled()) {
        _imageView.setImage(this.imageForState(module.CONTROL_STATE_DISABLED));
        if (!this.hasSpecificImageForState(module.CONTROL_STATE_DISABLED)) {
          _imageView.setAlpha(0.5 * this.alpha());
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
    
    that.setShadowEnabled = function(flag) {
      if (flag === undefined || flag === null || flag === 0 || flag === false) {
        _labelText2.alpha = 0.0;
      }
      else {
        _labelText2.alpha = 1.0;
      }
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
    that.mouseDownFromDOM = function(){
      that.setNeedsUpdate();
      isButtonDown = true;
      that.updateView ();
    }

    that.mouseUpFromDOM = function(){
      that.setNeedsUpdate();
      isButtonDown = false;
      that.updateView ();
    }
    
    that.setShadow = function(shadow) {
      _labelText.shadow = shadow;
      that.setNeedsLayout();
    }
    
    that.shadow = function() {
      return _labelText.shadow;
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






