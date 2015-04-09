/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createTargetView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'TargetView';
    
    var _targetedView = null;
    var _arrowImageView = null;
    var _hoverImageView = null;   
    var _action = null;

    var that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setHovered: AWE.Ext.superior(that, "setHovered"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndTargetedView = function(controller, targetedView, options, frame) {
      _super.initWithController(controller, frame);
      _targetedView = targetedView;
      
      _hoverImageView = AWE.UI.createImageView();
      _hoverImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/army/target_background"));
      _hoverImageView.setFrame(AWE.Geometry.createRect(0, 0, 64, 64));
      _hoverImageView.setVisible(false);
      this.addChild(_hoverImageView);

      _arrowImageView = AWE.UI.createImageView();
      if(options && options.action && options.action === AWE.Config.ACTION_ATTACK)
      {
        _arrowImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/army/target/attack"));
      }
      else
      {
        _arrowImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/army/target"));
      }
      
      _arrowImageView.setFrame(AWE.Geometry.createRect(0, 0, 64, 64));
      _arrowImageView.onClick = that.onClick;
      _arrowImageView.onMouseOver = that.onMouseOver;
      _arrowImageView.onMouseOut = that.onMouseOut;
      this.addChild(_arrowImageView);

      if (!frame) {
        my.frame.size.width = 64;
        my.frame.size.height = 64;
      }
    };
    
    that.updateView = function() {
      _hoverImageView.setVisible(this.hovered());
      _super.updateView();
    }
    
    that.targetedView = function() {
      return _targetedView;
    }
    
    that.onClick = function() {
      my.controller.viewClicked(_targetedView);
    };
            
    that.onMouseOver = function(evt){ 
      my.controller.viewMouseOver(that);
    };

    that.onMouseOut = function(evt){
      my.controller.viewMouseOut(that);
    };    
                    
    return that;
  };

  module.createRegionTargetView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'RegionTargetView';
    
    var _targetedView = null;
    var _glowImageView = null;   

    var that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setHovered: AWE.Ext.superior(that, "setHovered"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndTargetedView = function(controller, targetedView, frame) {
      _super.initWithController(controller, frame);
      _targetedView = targetedView;
      
      _glowImageView = AWE.UI.createImageView();
      _glowImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/tiles/glow/512"));

      if(frame) {
        _glowImageView.setFrame(frame);
      }
      else
      {
        _glowImageView.setFrame(AWE.Geometry.createRect(0, 0, targetedView.frame.size.width, targetedView.frame.size.height));
      }
      _glowImageView.onClick = that.onClick;
      _glowImageView.onMouseOver = that.onMouseOver;
      _glowImageView.onMouseOut = that.onMouseOut;
      this.addChild(_glowImageView);

      if (!frame) {
        my.frame.size.width = 128;
        my.frame.size.height = 128;
      }
    };
    
    that.updateView = function() {
      _super.updateView();
    }
    
    that.targetedView = function() {
      return _targetedView;
    }

    that.setFrame = function(newFrame) {
      _super.setFrame(newFrame);
      _glowImageView.setFrame(AWE.Geometry.createRect(0, 45, my.frame.size.width, my.frame.size.height));
    }
    
    that.onClick = function() {
      _targetedView.onClick();
    };
            
    that.onMouseOver = function(evt){ 
      my.controller.viewMouseOver(that);
    };

    that.onMouseOut = function(evt){
      my.controller.viewMouseOut(that);
    };    
                    
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



