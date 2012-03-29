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
    
    my.typeName = "armyHighlightView";
        
    var _army = null;    
    var _container = null;
    
    var _infoText1 = null;    
    var _infoText2 = null;    
    var _infoText3 = null;    
    var _healthShape = null;    
    var _actionPointsText = null;    
        
    var that = module.createView(spec, my);
    
    var _super = {
      initWithController: that.superior("initWithController"),
      layoutSubviews: that.superior("layoutSubviews"),
      setFrame: that.superior("setFrame"),
    }

    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      _army = army;
      
      _container = new Container();        

      var backgroundGraphics = new Graphics();
      backgroundGraphics.setStrokeStyle(0);
      backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundGraphics.drawRoundRect(128, 4, 64, 56, 8);
      var backgroundShape = new Shape(backgroundGraphics);
      _container.addChild(backgroundShape);
      
      var _infoText1 = new Text("Text 1", "12px Arial", "#FFF");
      _infoText1.textBaseline = "bottom";
      _infoText1.textAlign = "left";
      _infoText1.x = 156;
      _infoText1.y = 24;
      _container.addChild(_infoText1);
    
      var _infoText2 = new Text("Text 2", "12px Arial", "#FFF");
      _infoText2.textBaseline = "bottom";
      _infoText2.textAlign = "left";
      _infoText2.x = 156;
      _infoText2.y = 40;
      _container.addChild(_infoText2);
    
      var _infoText3 = new Text("Text 3", "12px Arial", "#FFF");
      _infoText3.textBaseline = "bottom";
      _infoText3.textAlign = "left";
      _infoText3.x = 156;
      _infoText3.y = 56;
      _container.addChild(_infoText3);
    
      var healthBGGraphics = new Graphics();
      healthBGGraphics.setStrokeStyle(1);
      healthBGGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      healthBGGraphics.beginFill('rgb(127, 127, 127)');
      healthBGGraphics.drawRoundRect(64, 108, 64, 12, 4);
      var healthBGShape = new Shape(healthBGGraphics);
      _container.addChild(healthBGShape);

      var healthGraphics = new Graphics();
      healthGraphics.setStrokeStyle(1);
      healthGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      healthGraphics.beginFill('rgb(255, 64, 64)');
      healthGraphics.drawRoundRect(64, 108, 48, 12, 4);
      _healthShape = new Shape(healthGraphics);
      _container.addChild(_healthShape);

      var _actionPointsText = new Text("8 / 10", "10px Arial", "#000");
      _actionPointsText.textBaseline = "bottom";
      _actionPointsText.textAlign = "center";
      _actionPointsText.x = 96;
      _actionPointsText.y = 119;
      _container.addChild(_actionPointsText);
    
      if (!frame) {
        my.frame.size.width = 192;
        my.frame.size.height = 128;
      }
    }

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = frame.origin.x;
      _container.y = frame.origin.y;
    }
    
    that.layoutSubviews = function() {
      _needsLayout = false;
      _needsDisplay = true;
    }
    
    that.displayObject = function() {
      return _container;
    }
            
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));




