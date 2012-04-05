/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createFortressHighlightView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = "FortressHighlightView";
    
    var _node = null;    
    var _container = null;
    
    var _infoText1View = null;    
    var _infoText2View = null;    
    var mouseOverImageView = null;
        
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    }
    
    that.initWithControllerAndNode = function(controller, node, frame) {
      _super.initWithController(controller, frame);
      _node = node;
      
      _container = new Container();
      
      var backgroundGraphics = new Graphics();
      backgroundGraphics.setStrokeStyle(0);
      backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundGraphics.drawRoundRect(128, 12, 64, 44, 8);
      var backgroundShape = new Shape(backgroundGraphics);
      _container.addChild(backgroundShape);
      
      _infoText1View = AWE.UI.createLabelView();
      _infoText1View.initWithControllerAndLabel(controller);
      _infoText1View.setFrame(AWE.Geometry.createRect(130, 11, 60, 24));      
      _infoText1View.setTextAlign("left");
      _infoText1View.setIconImage("map/display/icon");
      _infoText1View.setText('120%');
      _container.addChild(_infoText1View.displayObject());

      _infoText2View = AWE.UI.createLabelView();
      _infoText2View.initWithControllerAndLabel(controller);
      _infoText2View.setFrame(AWE.Geometry.createRect(130, 33, 60, 24));      
      _infoText2View.setTextAlign("left");
      _infoText2View.setIconImage("map/display/icon");
      _infoText2View.setText(AWE.Config.DEV_ALLIANCE_ID ===  _node.region().allianceId() ? 'Friendly' :  'Hostile');
      _container.addChild(_infoText2View.displayObject());
      
      if (AWE.Config.DEV_ALLIANCE_ID ===  _node.region().allianceId()) {
        mouseOverImageView = AWE.UI.createImageView();
        mouseOverImageView.initWithControllerAndImage(that, AWE.UI.ImageCache.getImage("map/easement"));
        mouseOverImageView.setFrame(AWE.Geometry.createRect(80, 0, 32, 32));
        mouseOverImageView.setContentMode(module.setContentModeNone);
        _container.addChild(mouseOverImageView.displayObject());
      }
      
      if (!frame) {
        my.frame.size.width = 192;
        my.frame.size.height = 128;
      }
      
      that.layoutSubviews();  
    }
    
    that.updateView = function() {
      that.setNeedsLayout();
    }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;
    }
    
    that.layoutSubviews = function() {
      _super.layoutSubviews();
      _infoText1View.layoutIfNeeded();
      _infoText2View.layoutIfNeeded();
    }
    
    that.displayObject = function() {
      return _container;
    }
            
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));








