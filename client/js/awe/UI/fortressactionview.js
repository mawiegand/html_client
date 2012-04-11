/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createFortressActionView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = 'FortressActionView';
    
    var _node = null;
    
    var _container = null;

    // selected
    var _moveButtonView = null;    
    var _attackButtonView = null;    

    //  hovered
    var _infoText1View = null;    
    var _infoText2View = null;    
    var mouseOverImageView = null;


    var that = module.createView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
    };

    
    that.initWithControllerAndView = function(controller, view, frame) {
      _super.initWithController(controller, frame);
      _container = new Container();
      _node = view.node();
      
      _moveButtonView = AWE.UI.createButtonView();
      _moveButtonView.initWithControllerTextAndImage(controller, 'move', AWE.UI.ImageCache.getImage("map/button1"));
      _moveButtonView.setFrame(AWE.Geometry.createRect(12, 70, 52, 52));
      _container.addChild(_moveButtonView.displayObject());

      _attackButtonView = AWE.UI.createButtonView();
      _attackButtonView.initWithControllerTextAndImage(controller, 'attack', AWE.UI.ImageCache.getImage("map/button1"));
      _attackButtonView.setFrame(AWE.Geometry.createRect(128, 70, 52, 52));
      _attackButtonView.onClick = function() { that.onAttackButtonClick(); }
      _container.addChild(_attackButtonView.displayObject());
      
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
      _infoText2View.setText(AWE.Config.DEV_ALLIANCE_ID ===  _node.region().allianceId() ? 'Neutral' :  'Hostile');
      _container.addChild(_infoText2View.displayObject());
      
      if (AWE.Config.DEV_ALLIANCE_ID !==  _node.region().allianceId()) {
        mouseOverImageView = AWE.UI.createImageView();
        mouseOverImageView.initWithControllerAndImage(that, AWE.UI.ImageCache.getImage("map/easement"));
        mouseOverImageView.setFrame(AWE.Geometry.createRect(80, 0, 32, 32));
        mouseOverImageView.setContentMode(module.setContentModeNone);
        _container.addChild(mouseOverImageView.displayObject());
      }
      
      my.frame.size.width = 192;
      my.frame.size.height = 128;
    }

    that.onAttackButtonClick = function() {};
    
    that.updateView = function() {
      that.setNeedsDisplay();
    }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
            
    that.setSelected = function(selected) {
      my.selected = selected;
    };
    
    that.displayObject = function() {
      return _container;
    };
    
    that.layoutSubviews = function() {
      _super.layoutSubviews();
      _infoText1View.layoutIfNeeded();
      _infoText2View.layoutIfNeeded();
    }
        
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));






