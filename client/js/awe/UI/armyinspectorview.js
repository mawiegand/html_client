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
    var _infoButtonView = null;
    var _reinforceButtonView = null;
    var _prevButtonView = null;
    var _nextButtonView = null;
    var _flagView = null;
    
    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    that.onFlagClicked = null;
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithController(controller, frame);
      
      _army = army;
      
      log('window', window);

      var backgroundShapeGraphics = new Graphics();
      backgroundShapeGraphics.setStrokeStyle(0);
      backgroundShapeGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundShapeGraphics.drawRoundRect(0, 14, 230, 100, 6);
      var _backgroundShapeView = AWE.UI.createShapeView();
      _backgroundShapeView.initWithControllerAndGraphics(my.controller, backgroundShapeGraphics);
      _backgroundShapeView.setFrame(AWE.Geometry.createRect(0, 0, 230, 100));
      this.addChildAt(_backgroundShapeView, 0);      

      _nameLabelView = AWE.UI.createLabelView();
      _nameLabelView.initWithControllerAndLabel(controller);
      _nameLabelView.setFrame(AWE.Geometry.createRect(5, 15, 100, 24));      
      _nameLabelView.setTextAlign("left");
      // _nameLabelView.setIconImage("map/icon/heads");
      this.addChild(_nameLabelView);

      _apLabelView = AWE.UI.createLabelView();
      _apLabelView.initWithControllerAndLabel(controller);
      _apLabelView.setFrame(AWE.Geometry.createRect(5, 40, 100, 24));      
      _apLabelView.setTextAlign("left");
      _apLabelView.setIconImage("map/icon/actionpoints");
      this.addChild(_apLabelView);

      _locationLabelView = AWE.UI.createLabelView();
      _locationLabelView.initWithControllerAndLabel(controller);
      _locationLabelView.setFrame(AWE.Geometry.createRect(5, 65, 100, 24));      
      _locationLabelView.setTextAlign("left");
      _locationLabelView.setIconImage("map/icon/home");
      this.addChild(_locationLabelView);

      _rankLabelView = AWE.UI.createLabelView();
      _rankLabelView.initWithControllerAndLabel(controller);
      _rankLabelView.setTextAlign("left");
      _rankLabelView.setIconImage("map/icon/rank");
      _rankLabelView.setFrame(AWE.Geometry.createRect(5, 90, 100, 24));      
      this.addChild(_rankLabelView);

      _sizeAllLabelView = AWE.UI.createLabelView();
      _sizeAllLabelView.initWithControllerAndLabel(controller);
      _sizeAllLabelView.setFrame(AWE.Geometry.createRect(105, 15, 100, 24));      
      _sizeAllLabelView.setTextAlign("left");
      _sizeAllLabelView.setIconImage("map/icon/army/size");
      this.addChild(_sizeAllLabelView);

      _sizeType1LabelView = AWE.UI.createLabelView();
      _sizeType1LabelView.initWithControllerAndLabel(controller);
      _sizeType1LabelView.setFrame(AWE.Geometry.createRect(105, 40, 100, 24));      
      _sizeType1LabelView.setTextAlign("left");
      _sizeType1LabelView.setIconImage("map/icon/army/size1");
      this.addChild(_sizeType1LabelView);

      _sizeType2LabelView = AWE.UI.createLabelView();
      _sizeType2LabelView.initWithControllerAndLabel(controller);
      _sizeType2LabelView.setFrame(AWE.Geometry.createRect(105, 65, 100, 24));      
      _sizeType2LabelView.setTextAlign("left");
      _sizeType2LabelView.setIconImage("map/icon/army/size2");
      this.addChild(_sizeType2LabelView);

      _sizeType3LabelView = AWE.UI.createLabelView();
      _sizeType3LabelView.initWithControllerAndLabel(controller);
      _sizeType3LabelView.setTextAlign("left");
      _sizeType3LabelView.setIconImage("map/icon/army/size3");
      _sizeType3LabelView.setFrame(AWE.Geometry.createRect(105, 90, 100, 24));      
      this.addChild(_sizeType3LabelView);
      
      // kreis drum
      var circleGraphics = new Graphics();
      circleGraphics.setStrokeStyle(1);
      circleGraphics.beginStroke('rgb(0, 0, 0)');
      circleGraphics.beginFill('rgb(255, 255, 255)');
      circleGraphics.drawCircle(64, 64, 64);
      var _circleShape = AWE.UI.createShapeView();
      _circleShape.initWithControllerAndGraphics(my.controller, circleGraphics);
      _circleShape.setFrame(AWE.Geometry.createRect(184, 0, 64, 64));
      this.addChild(_circleShape);      

      // Image view für held
      var stance = _army.get('stance')
      var offX = stance == 0 ? 12 : 0;
      var offY = stance == 0 ? 2 : 0;
      
      var _baseGraphics = new Graphics();
      _baseGraphics.setStrokeStyle(1);
      _baseGraphics.beginStroke(Graphics.getRGB(0, 0, 0));
      _baseGraphics.beginFill(Graphics.getRGB(0, 0, 0));
      _baseGraphics.drawEllipse(0, 0, 59, 26);
      _baseShape = AWE.UI.createShapeView();
      _baseShape.initWithControllerAndGraphics(my.controller, _baseGraphics);
      _baseShape.setFrame(AWE.Geometry.createRect(219, 92, 59, 26));
      this.addChild(_baseShape);      

      _stanceView = AWE.UI.createImageView();
      _stanceView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage(AWE.Config.MAP_STANCE_IMAGES[stance]));
      _stanceView.setFrame(AWE.Geometry.createRect(208 + offX, -12 + offY, 80, 120));
      _stanceView.onClick = that.onClick;
      _stanceView.onMouseOver = that.onMouseOver;
      _stanceView.onMouseOut = that.onMouseOut;
      this.addChild(_stanceView);

      // Allicance Flag
      var allianceId = _army.get('alliance_id')
      if (allianceId) {
        _flagView = AWE.UI.createAllianceFlagView();
        _flagView.initWithController(controller);
        _flagView.setFrame(AWE.Geometry.createRect(150, 0, 60, 75));
        _flagView.setAllianceId(allianceId);
        // _flagView.setTagVisible(true);
        _flagView.onClick = function() { 
          if (that.onFlagClicked) {
            that.onFlagClicked(allianceId);
          };
        };
        this.addChild(_flagView);
      }

      _infoButtonView = AWE.UI.createButtonView();
      _infoButtonView.initWithControllerTextAndImage(controller, 'Info', AWE.UI.ImageCache.getImage("map/button1"));
      _infoButtonView.setFrame(AWE.Geometry.createRect(180, 0, 48, 48));
      _infoButtonView.onClick = function() {
         that.onInventoryButtonClick(_army) 
      };
      this.addChild(_infoButtonView);

      // buttons oben
      if (_army.isOwn()) {  
        _reinforceButtonView = AWE.UI.createButtonView();
        _reinforceButtonView.initWithControllerTextAndImage(controller, 'Reinforce', AWE.UI.ImageCache.getImage("map/button1"));
        _reinforceButtonView.setFrame(AWE.Geometry.createRect(268, 0, 48, 48));
        this.addChild(_reinforceButtonView);

        // button unten
        _prevButtonView = AWE.UI.createButtonView();
        _prevButtonView.initWithControllerTextAndImage(controller, '<<', AWE.UI.ImageCache.getImage("map/button1"));
        _prevButtonView.setFrame(AWE.Geometry.createRect(180, 92, 36, 36));
        this.addChild(_prevButtonView);
  
        _nextButtonView = AWE.UI.createButtonView();
        _nextButtonView.initWithControllerTextAndImage(controller, '>>', AWE.UI.ImageCache.getImage("map/button1"));
        _nextButtonView.setFrame(AWE.Geometry.createRect(280, 92, 36, 36));
        this.addChild(_nextButtonView);
      }
    };
    
    that.onInventoryButtonClick = function() { console.log('inventory button clicked'); }
        
    that.updateView = function() {
      
      _nameLabelView.setText(_army.get('name'));
      if (_army.isOwn()) {
        _apLabelView.setText('AP: ' + AWE.UI.Util.secondsToString(_army.get('ap_seconds_per_point')));
        _reinforceButtonView.setEnabled(_army.get('home_settlement_id') === _army.get('location_id'));
      }
      else {
        _apLabelView.setText(_army.get('owner_name') + (_army.get('alliance_tag') ? ' | ' + _army.get('alliance_tag') : ''));        
      }
      
      _locationLabelView.setText('Home');
      _rankLabelView.setText(_army.get('rank'));
      _sizeAllLabelView.setText(_army.get('size_present'));
      _sizeType1LabelView.setText(_army.get('size_present'));
      _sizeType2LabelView.setText(_army.get('size_present'));
      _sizeType3LabelView.setText(_army.get('size_present'));
      

      if (_flagView) {      
        this.removeChild(_flagView);
      }
      var allianceId = _army.get('alliance_id')
      if (allianceId) {
        _flagView = AWE.UI.createAllianceFlagView();
        _flagView.initWithController(my.controller);
        _flagView.setFrame(AWE.Geometry.createRect(150, 0, 60, 75));
        _flagView.setAllianceId(allianceId);
        // _flagView.setTagVisible(true);
        _flagView.onClick = function() { 
          if (that.onFlagClicked) {
            that.onFlagClicked(allianceId);
          };
        };
        this.addChildAt(_flagView, 10);
      }
      
      _super.updateView();
    };   
    
    that.army = function() {
      return _army;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




