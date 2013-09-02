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
      
      _hoverImageView = AWE.UI.createImageView();
      _hoverImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/army/target_background"));
      _hoverImageView.setFrame(AWE.Geometry.createRect(0, 0, 64, 64));
      _hoverImageView.setVisible(false);
      this.addChild(_hoverImageView);

      _arrowImageView = AWE.UI.createImageView();
      _arrowImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/army/target"));
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
      
  return module;
    
}(AWE.UI || {}));



