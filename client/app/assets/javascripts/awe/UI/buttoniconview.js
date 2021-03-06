/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
            
  module.createButtonIconView = function(spec, my) {
        
    var _backgroundImageView = null;
    var _iconImageView = null;
    var _activeGlowView = null;
    
    var backgroundImagesForStates = {}; 
    var iconImagesForStates = {};
    
    var isButtonDown = false;

    my = my || {};
    
    my.typeName = "ButtonIconView";
    my.container = null;
        
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setEnabled: AWE.Ext.superior(that, "setEnabled"),
      setVisible: AWE.Ext.superior(that, "setVisible"),
    }
    
    that.onMouseOver = function() { 
      document.body.style.cursor = "pointer";
      that.setHovered(true);
    }
    that.onMouseOut =  function() {
      document.body.style.cursor = "default";
      that.setHovered(false); 
    }

    
    that.initWithControllerImageAndIcon = function(controller, images, icons, frame, activeGlow) {
      _super.initWithController(controller, frame);
      
      my.container = new Container();
      
      backgroundImagesForStates[module.CONTROL_STATE_NORMAL] = images.normal;
      iconImagesForStates[module.CONTROL_STATE_NORMAL] = icons.normal;

      if(images.hover)
      {
        backgroundImagesForStates[module.CONTROL_STATE_HOVERED] = images.hover;
      }
      if(icons.hover)
      {
         iconImagesForStates[module.CONTROL_STATE_HOVERED] = icons.hover;
      }
      if(images.active)
      {
        backgroundImagesForStates[module.CONTROL_STATE_SELECTED] = images.active;
      }
      if(icons.active)
      {
        iconImagesForStates[module.CONTROL_STATE_SELECTED] = icons.active;
      }

      if(activeGlow)
      {
        _activeGlowView = AWE.UI.createImageView();
        _activeGlowView.initWithControllerAndImage(controller, activeGlow);
        _activeGlowView.setContentMode(module.ViewContentModeFit);

        _activeGlowView.setFrame(AWE.Geometry.createRect(activeGlow.width / 4, activeGlow.height / 4, activeGlow.width, activeGlow.height));
        _activeGlowView.setPivot(activeGlow.width/2, activeGlow.height/2);
        _activeGlowView.setAlpha(0);
        my.container.addChild(_activeGlowView.displayObject());
        var animation = AWE.UI.createEndlessAnimation({
          view:_activeGlowView,
          duration:10000,

          updateView:function () {
            return function (view) {
              view.rotate(5);
            };
          }(),
        });
        controller.addAnimation(animation);
      }

      _backgroundImageView = AWE.UI.createImageView();
      _backgroundImageView.initWithControllerAndImage(controller, images.normal);
      _backgroundImageView.setContentMode(module.ViewContentModeFit);
      _backgroundImageView.onMouseDown = function() { 
        that.setNeedsUpdate();
        isButtonDown = true;
        that.updateView ();
      };
      _backgroundImageView.onMouseUp = function(){
        that.setNeedsUpdate();
        isButtonDown = false;
        that.updateView ();
      };
      _backgroundImageView.onClick = function() { 
        if (that.enabled()) {
          that.onClick() 
        }
        else
        {
          that.onDisabledClick();
        }
      }; // CAUTION: need to wrap the call in a function, because otherwise it's not possible to attach a different function to that as onClick handler
      _backgroundImageView.onDoubleClick = function() { 
        if (that.enabled()) {
          that.onDoubleClick() 
        }
      };
      _backgroundImageView.onMouseOver = function(event) { that.onMouseOver(event); }
      _backgroundImageView.onMouseOut =  function(event) { that.onMouseOut(event); }
      my.container.addChild(_backgroundImageView.displayObject());
      
      _iconImageView = AWE.UI.createImageView();
      _iconImageView.initWithControllerAndImage(controller, icons.normal);
      _iconImageView.setContentMode(module.ViewContentModeFit);
      
      _iconImageView.setFrame(AWE.Geometry.createRect((images.normal.width - icons.normal.width) / 2, (images.normal.height - icons.normal.height) / 2, icons.normal.width, icons.normal.height));

      _iconImageView.onMouseDown = function() { 
        that.setNeedsUpdate();
        isButtonDown = true;
        that.updateView();
      };
      _iconImageView.onMouseUp = function(){
        that.setNeedsUpdate();
        isButtonDown = false;
        that.updateView ();
      };
      _iconImageView.onClick = function() { 
        if (that.enabled()) {
          that.onClick() 
        }
        else
        {
          that.onDisabledClick();
        }
      }; // CAUTION: need to wrap the call in a function, because otherwise it's not possible to attach a different function to that as onClick handler
      _iconImageView.onDoubleClick = function() { 
        if (that.enabled()) {
          that.onDoubleClick() 
        }
      };
      _iconImageView.onMouseOver = function(event) { that.onMouseOver(event); }
      _iconImageView.onMouseOut =  function(event) { that.onMouseOut(event); }
      my.container.addChild(_iconImageView.displayObject());      

      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
    }
    
    that.updateView = function() {

      _backgroundImageView.setAlpha(this.alpha()); // usual case
      _iconImageView.setAlpha(this.alpha());

      if (this.enabled()) {  // make sure, the button has the correct alpha value, if enabled
        _backgroundImageView.setAlpha(this.alpha());
        _iconImageView.setAlpha(this.alpha());
        if(isButtonDown){
          _backgroundImageView.setAlpha(0.7 * this.alpha());
          _iconImageView.setAlpha(0.7 * this.alpha());
        }
        else{
          _backgroundImageView.setAlpha(this.alpha());
          _iconImageView.setAlpha(this.alpha());
        }
      }
      
      if (!this.enabled()) {
        _backgroundImageView.setImage(this.backgroundImageForState(module.CONTROL_STATE_DISABLED));
        _iconImageView.setImage(this.iconImageForState(module.CONTROL_STATE_DISABLED));
        if (!this.hasSpecificBackgroundImageForState(module.CONTROL_STATE_DISABLED)) {
          _backgroundImageView.setAlpha(0.5 * this.alpha());
          _iconImageView.setAlpha(0.5 * this.alpha());
        }
      }
      else if (this.selected()) {
        _backgroundImageView.setImage(this.backgroundImageForState(module.CONTROL_STATE_SELECTED));
        _iconImageView.setImage(this.iconImageForState(module.CONTROL_STATE_SELECTED));
        if(_activeGlowView != null)
        {
          _activeGlowView.setAlpha(1);
        }
      }
      else if (this.hovered()) {
        _backgroundImageView.setImage(this.backgroundImageForState(module.CONTROL_STATE_HOVERED));
        _iconImageView.setImage(this.iconImageForState(module.CONTROL_STATE_HOVERED));
      }
      else {
        _backgroundImageView.setImage(this.backgroundImageForState(module.CONTROL_STATE_NORMAL));
        _iconImageView.setImage(this.iconImageForState(module.CONTROL_STATE_NORMAL));
        if(_activeGlowView != null)
        {
          _activeGlowView.setAlpha(0);
        }
      }
    }
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      
      my.container.x = frame.origin.x;
      my.container.y = frame.origin.y;      
      
      _backgroundImageView.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
      _iconImageView.setFrame(AWE.Geometry.createRect(0, 0, my.frame.size.width, my.frame.size.height));
    }
    
    that.displayObject = function() {
      return my.container;
    }
    
    that.setBackgroundImageForState = function(image, controlState) {
      backgroundImagesForStates[controlState] = image;
      this.setNeedsUpdate();
    }
    
    that.setIconImageForState = function(image, controlState) {
      iconImagesForStates[controlState] = image;
      this.setNeedsUpdate();
    }
    
    that.backgroundImageForState = function(controlState) {
      if (backgroundImagesForStates[controlState] === undefined || backgroundImagesForStates[controlState] === null) {
        return backgroundImagesForStates[module.CONTROL_STATE_NORMAL];
      }
      else {
        return backgroundImagesForStates[controlState];
      }
    }
    
    that.iconImageForState = function(controlState) {
      if (iconImagesForStates[controlState] === undefined || iconImagesForStates[controlState] === null) {
        return iconImagesForStates[module.CONTROL_STATE_NORMAL];
      }
      else {
        return iconImagesForStates[controlState];
      }
    }
    
    that.hasSpecificBackgroundImageForState = function(controlState) {
      return !(backgroundImagesForStates[controlState] === undefined || backgroundImagesForStates[controlState] === null)
    }
    
    that.hasSpecificIconImageForState = function(controlState) {
      return !(iconImagesForStates[controlState] === undefined || iconImagesForStates[controlState] === null)
    }
    
    /* actions */
    
    
    that.onClick = function() {
      log('button on click');
      if (that.enabled()) {
        my.controller.buttonClicked(that);
      }
    };

    that.onDisabledClick = function() {

    };
    
        
    return that;
  };
    
  return module;
    
}(AWE.UI || {}));






