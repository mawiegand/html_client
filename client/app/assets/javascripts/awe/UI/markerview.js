/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createMarkerView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'MarkerView';
    
    var _targetedView = null;
    var _arrowImageView = null;

    var that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setHovered: AWE.Ext.superior(that, "setHovered"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndMarkedView = function(controller, targetedView, frame) {
      _super.initWithController(controller, frame);
      _targetedView = targetedView;
      _arrowImageView = AWE.UI.createImageView();
      _arrowImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("ui/marker/down"));
      _arrowImageView.setFrame(AWE.Geometry.createRect(0, 0, 48, 48));
      this.addChild(_arrowImageView);

      if (!frame) {
        my.frame.size.width = 48;
        my.frame.size.height = 48;
      }
    };
    
    that.updateView = function() {
      _super.updateView();
    }
    
    that.targetedView = function() {
      return _targetedView;
    }
    
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



