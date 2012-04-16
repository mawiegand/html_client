/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createTargetView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'TargetView';
    
    var _container = null;
    var _location = null;

    var _arrowImageView = null;     

    var that = module.createView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndLocation = function(controller, location, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _location = location;
      
      _arrowImageView = AWE.UI.createImageView();
      _arrowImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/army/target"));
      _arrowImageView.setFrame(AWE.Geometry.createRect(0, 0, 64, 64));
      _container.addChild(_arrowImageView.displayObject());

      if (!frame) {
        my.frame.size.width = 64;
        my.frame.size.height = 64;
      }
    };
    
    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
                
    that.displayObject = function() {
      return _container;
    };
    
    that.location = function() {
      return that._location;
    }
            
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



