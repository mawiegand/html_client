/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createOutpostAnnotationView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'OutpostAnnotationView';
    
    var _outpostView = null;
    
    var _container = null;

    // selected
    var _infoText1View = null;    

    var that = module.createView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndView = function(controller, view, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _outpostView = view;
      
      _infoText1View = AWE.UI.createLabelView();
      _infoText1View.initWithControllerAndLabel(controller);
      _infoText1View.setFrame(AWE.Geometry.createRect(130, 0, 66, 24));      
      _infoText1View.setTextAlign("left");
      _infoText1View.setIconImage("map/display/icon");
      _infoText1View.setText('Selected');
      _container.addChild(_infoText1View.displayObject());

      if (!frame) {
        my.frame.size.width = 192;
        my.frame.size.height = 128;
      }
    };
    
    that.updateView = function() {
      
      _infoText1View.setOrigin(AWE.Geometry.createPoint(130, 0));
      
      that.setNeedsDisplay();
      that.setNeedsLayout();
    }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
                
    that.displayObject = function() {
      return _container;
    };
    
    that.layoutSubviews = function() {
      _super.layoutSubviews();
      _infoText1View.layoutIfNeeded();
    }
    
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



