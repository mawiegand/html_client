/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createArmyInspectorView = function(spec, my) {

    var that;

    my = my || {};
    
    my.typeName = 'ArmyInspectorView';
    
    var _container = null;
    
    var _army = null;
    
    var _nameLabelView = null;
    var _allianceTagLabel = null;
    var _apLabelView = null;
    var _locationLabelView = null;
    var _rankLabelView = null;
    var _sizeAllLabelView = null;
    var _sizeType1LabelView = null;
    var _sizeType2LabelView = null;
    var _sizeType3LabelView = null;
    
    var _baseShape = null;
    var _stanceView = null;
    var _invButtonView = null;
    var _moveButtonView = null;
    var _prevButtonView = null;
    var _nextButtonView = null;
    var _flagShape = null;
    
    that = module.createView(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
    };
    
    that.onFlagClicked = null;
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      _container = new Container()
      
      _army = army;

      var backgroundShapeGraphics = new Graphics();
      backgroundShapeGraphics.setStrokeStyle(0);
      backgroundShapeGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundShapeGraphics.drawRoundRect(0, 14, 230, 100, 6);
      var backgroundShape = new Shape(backgroundShapeGraphics);    
      _container.addChild(backgroundShape);

      _nameLabelView = AWE.UI.createLabelView();
      _nameLabelView.initWithControllerAndLabel(controller);
      _nameLabelView.setFrame(AWE.Geometry.createRect(5, 15, 100, 24));      
      _nameLabelView.setTextAlign("left");
      _nameLabelView.setIconImage("map/display/icon");
      _container.addChild(_nameLabelView.displayObject());

      _apLabelView = AWE.UI.createLabelView();
      _apLabelView.initWithControllerAndLabel(controller);
      _apLabelView.setFrame(AWE.Geometry.createRect(5, 40, 100, 24));      
      _apLabelView.setTextAlign("left");
      _apLabelView.setIconImage("map/display/icon");
      _container.addChild(_apLabelView.displayObject());

      _locationLabelView = AWE.UI.createLabelView();
      _locationLabelView.initWithControllerAndLabel(controller);
      _locationLabelView.setFrame(AWE.Geometry.createRect(5, 65, 100, 24));      
      _locationLabelView.setTextAlign("left");
      _locationLabelView.setIconImage("map/display/icon");
      _container.addChild(_locationLabelView.displayObject());

      _rankLabelView = AWE.UI.createLabelView();
      _rankLabelView.initWithControllerAndLabel(controller);
      _rankLabelView.setTextAlign("left");
      _rankLabelView.setIconImage("map/display/icon");
      _rankLabelView.setFrame(AWE.Geometry.createRect(5, 90, 100, 24));      
      _container.addChild(_rankLabelView.displayObject());

      _sizeAllLabelView = AWE.UI.createLabelView();
      _sizeAllLabelView.initWithControllerAndLabel(controller);
      _sizeAllLabelView.setFrame(AWE.Geometry.createRect(105, 15, 100, 24));      
      _sizeAllLabelView.setTextAlign("left");
      _sizeAllLabelView.setIconImage("map/display/icon");
      _container.addChild(_sizeAllLabelView.displayObject());

      _sizeType1LabelView = AWE.UI.createLabelView();
      _sizeType1LabelView.initWithControllerAndLabel(controller);
      _sizeType1LabelView.setFrame(AWE.Geometry.createRect(105, 40, 100, 24));      
      _sizeType1LabelView.setTextAlign("left");
      _sizeType1LabelView.setIconImage("map/display/icon");
      _container.addChild(_sizeType1LabelView.displayObject());

      _sizeType2LabelView = AWE.UI.createLabelView();
      _sizeType2LabelView.initWithControllerAndLabel(controller);
      _sizeType2LabelView.setFrame(AWE.Geometry.createRect(105, 65, 100, 24));      
      _sizeType2LabelView.setTextAlign("left");
      _sizeType2LabelView.setIconImage("map/display/icon");
      _container.addChild(_sizeType2LabelView.displayObject());

      _sizeType3LabelView = AWE.UI.createLabelView();
      _sizeType3LabelView.initWithControllerAndLabel(controller);
      _sizeType3LabelView.setTextAlign("left");
      _sizeType3LabelView.setIconImage("map/display/icon");
      _sizeType3LabelView.setFrame(AWE.Geometry.createRect(105, 90, 100, 24));      
      _container.addChild(_sizeType3LabelView.displayObject());
      

      
      // kreis drum
      var circleGraphics = new Graphics();
      circleGraphics.setStrokeStyle(1);
      circleGraphics.beginStroke('rgb(0, 0, 0)');
      circleGraphics.beginFill('rgb(255, 255, 255)');
      circleGraphics.drawCircle(248, 64, 64);
      var _circleShape = new Shape(circleGraphics);    
      _container.addChild(_circleShape);

      // Image view für held
      var stance = _army.get('stance')
      var offX = stance == 0 ? 12:0;
      var offY = stance == 0 ? 2:0;
      
      var _baseGraphics = new Graphics();
      _baseGraphics.setStrokeStyle(1);
      _baseGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      _baseGraphics.beginFill(Graphics.getRGB(0, 0, 0));
      _baseGraphics.drawEllipse(219, 92, 59, 26);
      _baseShape = new Shape(_baseGraphics);  
      _container.addChild(_baseShape);

      _stanceView = AWE.UI.createImageView();
      _stanceView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(AWE.Config.MAP_STANCE_IMAGES[stance]));
      _stanceView.setFrame(AWE.Geometry.createRect(208 +offX, -12 + offY, 80, 120));
      _stanceView.onClick = that.onClick;
      _stanceView.onMouseOver = that.onMouseOver;
      _stanceView.onMouseOut = that.onMouseOut;
      _container.addChild(_stanceView.displayObject());

      // Allicance Flag
      var allianceId = _army.get('alliance_id')
      if (allianceId) {
        var _flagView = AWE.UI.createAllianceFlagView();
        _flagView.initWithController(controller);
        _flagView.setFrame(AWE.Geometry.createRect(150, 0, 60, 75));
        _flagView.setAllianceId(allianceId);
        _flagView.setTagVisible(true);
        _flagView.onClick = function() { 
          if (that.onFlagClicked) {
            that.onFlagClicked(allianceId);
          };
        };
        _container.addChild(_flagView.displayObject());
        _flagView.updateView();
      }

      _invButtonView = AWE.UI.createButtonView();
      _invButtonView.initWithControllerTextAndImage(controller, 'Info', AWE.UI.ImageCache.getImage("map/button1"));
      _invButtonView.setFrame(AWE.Geometry.createRect(180, 0, 48, 48));
      _invButtonView.onClick = function() {
         that.onInventoryButtonClick(_army) 
      };
      _container.addChild(_invButtonView.displayObject());


      // buttons oben
      if (_army.isOwn()) {
  
        _stanceButtonView = AWE.UI.createButtonView();
        _stanceButtonView.initWithControllerTextAndImage(controller, 'Stance', AWE.UI.ImageCache.getImage("map/button1"));
        _stanceButtonView.setFrame(AWE.Geometry.createRect(224, -20, 48, 48));
        _container.addChild(_stanceButtonView.displayObject());

        _reinforceButtonView = AWE.UI.createButtonView();
        _reinforceButtonView.initWithControllerTextAndImage(controller, 'Reinforce', AWE.UI.ImageCache.getImage("map/button1"));
        _reinforceButtonView.setFrame(AWE.Geometry.createRect(268, 0, 48, 48));
        _container.addChild(_reinforceButtonView.displayObject());

        // button unten
        _prevButtonView = AWE.UI.createButtonView();
        _prevButtonView.initWithControllerTextAndImage(controller, '<<', AWE.UI.ImageCache.getImage("map/button1"));
        _prevButtonView.setFrame(AWE.Geometry.createRect(180, 92, 36, 36));
        _container.addChild(_prevButtonView.displayObject());
  
        _nextButtonView = AWE.UI.createButtonView();
        _nextButtonView.initWithControllerTextAndImage(controller, '>>', AWE.UI.ImageCache.getImage("map/button1"));
        _nextButtonView.setFrame(AWE.Geometry.createRect(280, 92, 36, 36));
        _container.addChild(_nextButtonView.displayObject());
      }

      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    };
    
    that.onInventoryButtonClick = function() { console.log('inventory button clicked'); }
        
    that.layoutSubviews = function() {
      _super.layoutSubviews();
      _nameLabelView.layoutIfNeeded();
      _apLabelView.layoutIfNeeded();
      _locationLabelView.layoutIfNeeded();
      _rankLabelView.layoutIfNeeded();
      _sizeAllLabelView.layoutIfNeeded();
      _sizeType1LabelView.layoutIfNeeded();
      _sizeType2LabelView.layoutIfNeeded();
      _sizeType3LabelView.layoutIfNeeded();
    };

    that.setFrame = function(frame) {
      _super.setFrame(frame);
      _container.x = my.frame.origin.x;
      _container.y = my.frame.origin.y;
    }
    
    that.displayObject = function() {
      return _container;
    };

    that.updateView = function() {
      _nameLabelView.setText(_army.get('name'));
      if (_army.isOwn()) {
        _apLabelView.setText('AP: ' + AWE.UI.Util.secondsToString(_army.get('ap_seconds_per_point')));
      }
      else {
        _apLabelView.setText(_army.get('owner_name'));        
      }
      if (_allianceTagLabel) {
        if (_army.get('alliance_tag')) {
          _allianceTagLabel.setVisible(true);
          _allianceTagLabel.setText(_army.get('alliance_tag'));
        }
        else {
          _allianceTagLabel.setVisible(false);
        }
      }
      
      _locationLabelView.setText('Home');
      _rankLabelView.setText(_army.get('rank'));
      _sizeAllLabelView.setText(_army.get('size_present'));
      _sizeType1LabelView.setText(_army.get('size_present'));
      _sizeType2LabelView.setText(_army.get('size_present'));
      _sizeType3LabelView.setText(_army.get('size_present'));
    };   
    
    that.army = function() {
      return _army;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




