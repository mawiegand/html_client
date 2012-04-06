/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.rootNode = null;
  
  /*** AWE.UI.View ***/

  module.createArmyHighlightView = function(spec, my) {
    
    my = my || {};
    
    my.typeName = "ArmyHighlightView";
        
    var _army = null;    
    var _container = null;
    
    var _infoText1View = null;    
    var _infoText2View = null;    
    var _infoText3View = null;    
    var _actionPointsText = null;    
        
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
    }
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      _army = army;
      
      _container = new Container();
      
      if (_army.get('battle_id') || _army.get('target_location_id')) {
        var lines = 3;
      }
      else {
        var lines = 1;
      }        

      var backgroundGraphics = new Graphics();
      backgroundGraphics.setStrokeStyle(0);
      backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundGraphics.drawRoundRect(128, 34 - lines * 11, 64, lines * 22, 8);
      var backgroundShape = new Shape(backgroundGraphics);
      _container.addChild(backgroundShape);
      
      _infoText1View = AWE.UI.createLabelView();
      _infoText1View.initWithControllerAndLabel(controller);
      _infoText1View.setFrame(AWE.Geometry.createRect(130, 33 - lines * 11, 66, 24));      
      _infoText1View.setTextAlign("left");
      _infoText1View.setIconImage("map/display/icon");
      _infoText1View.setText(army.get('strength'));
      _container.addChild(_infoText1View.displayObject());

      if (lines > 1) {
        _infoText2View = AWE.UI.createLabelView();
        _infoText2View.initWithControllerAndLabel(controller);
        _infoText2View.setFrame(AWE.Geometry.createRect(130, 22, 66, 24));      
        _infoText2View.setTextAlign("left");
        _infoText2View.setIconImage("map/display/icon");
        _infoText2View.setText(army.get('strength'));
        _container.addChild(_infoText2View.displayObject());
  
        _infoText3View = AWE.UI.createLabelView();
        _infoText3View.initWithControllerAndLabel(controller);
        _infoText3View.setFrame(AWE.Geometry.createRect(130, 44, 1000, 24));      
        _infoText3View.setTextAlign("left");
        _infoText3View.setIconImage("map/display/icon");
        _infoText3View.setText(army.get('strength'));
        _container.addChild(_infoText3View.displayObject());
      }
      
      var _actionPointsText = new Text(army.get('ap_present') + " / " + army.get('ap_max'), "10px Arial", "#000");
      _actionPointsText.textBaseline = "bottom";
      _actionPointsText.textAlign = "center";
      _actionPointsText.x = 96;
      _actionPointsText.y = 119;
      _container.addChild(_actionPointsText);
    
      if (!frame) {
        my.frame.size.width = 192;
        my.frame.size.height = 128;
      }
      
      that.layoutSubviews();  
    }
    
    that.updateView = function() {
      that.setNeedsLayout();
    }

    that.army = function() { return _army; }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;
    }
    
    that.layoutSubviews = function() {
      _super.layoutSubviews();
      _infoText1View.layoutIfNeeded();
      if (_infoText2View) _infoText2View.layoutIfNeeded();
      if (_infoText3View) _infoText3View.layoutIfNeeded();
    }
    
    that.displayObject = function() {
      return _container;
    }
            
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));




