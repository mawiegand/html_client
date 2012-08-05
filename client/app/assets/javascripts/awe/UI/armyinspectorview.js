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
    var _stance = null;
    
    var _backgroundShapeView = null;
    var _nameLabelView = null;
    var _apLabelView = null;
    var _locationLabelView = null;
    var _rankLabelView = null;
    
    var _sizeAllLabelView = null;
    var _sizeType1LabelView = null;
    var _sizeType2LabelView = null;
    var _sizeType3LabelView = null;
    
    var _inspectorFrame = null;
    var _stanceView = null;
    var _flagView = null;
    var _flagFrameView = null;

    var _infoButtonView = null;
    var _reinforceButtonView = null;
    var _prevButtonView = null;
    var _nextButtonView = null;
    
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
      that.recalcView();
    };
    
    that.recalcView = function() {
      
      var isOwnArmy = _army.isOwn();
      
      if (!_backgroundShapeView) {
        var backgroundShapeGraphics = new Graphics();
        backgroundShapeGraphics.setStrokeStyle(0);
        backgroundShapeGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
        backgroundShapeGraphics.drawRoundRect(0, 14, 230, 100, 6);
        _backgroundShapeView = AWE.UI.createShapeView();
        _backgroundShapeView.initWithControllerAndGraphics(my.controller, backgroundShapeGraphics);
        _backgroundShapeView.setFrame(AWE.Geometry.createRect(0, 0, 230, 100));
        this.addChildAt(_backgroundShapeView, 0);
      }      

      if (!_nameLabelView) {
        _nameLabelView = AWE.UI.createLabelView();
        _nameLabelView.initWithControllerAndLabel(my.controller);
        _nameLabelView.setFrame(AWE.Geometry.createRect(5, 15, 100, 36));      
        _nameLabelView.setFont('24px "Helvetica Neue", Helvetica, Arial');
        _nameLabelView.setTextAlign("left");
        // _nameLabelView.setIconImage("map/icon/heads");
        this.addChild(_nameLabelView);
      }
      
      if (_army.get('name') !== _nameLabelView.text()) {
        _nameLabelView.setText(_army.get('name'));
      }


      if (!_apLabelView) {
        _apLabelView = AWE.UI.createLabelView();
        _apLabelView.initWithControllerAndLabel(my.controller);
        _apLabelView.setFrame(AWE.Geometry.createRect(5, 46, 100, 24));      
        _apLabelView.setTextAlign("left");
        _apLabelView.setIconImage("map/icon/actionpoints");
        this.addChild(_apLabelView);
      }
      
      if (isOwnArmy) {
        _apLabelView.setText('AP: ' + AWE.UI.Util.secondsToString(_army.get('ap_seconds_per_point')));
      }
      else {
        _apLabelView.setText(_army.get('owner_name') + (_army.get('alliance_tag') ? ' | ' + _army.get('alliance_tag') : ''));        
      }
      

      if (!_locationLabelView) {
        _locationLabelView = AWE.UI.createLabelView();
        _locationLabelView.initWithControllerAndLabel(my.controller);
        _locationLabelView.setFrame(AWE.Geometry.createRect(5, 68, 100, 24));      
        _locationLabelView.setTextAlign("left");
        _locationLabelView.setIconImage("map/icon/home");
        this.addChild(_locationLabelView);
      }
      
      _locationLabelView.setText(_army.get('home_settlement_name') ? _army.get('home_settlement_name') : '[Home]');
      
  /*    if (!_rankLabelView) {
        _rankLabelView = AWE.UI.createLabelView();
        _rankLabelView.initWithControllerAndLabel(my.controller);
        _rankLabelView.setTextAlign("left");
        _rankLabelView.setIconImage("map/icon/rank");
        _rankLabelView.setFrame(AWE.Geometry.createRect(5, 90, 100, 24));      
        this.addChild(_rankLabelView);
      }
      _rankLabelView.setText(_army.get('rank')); */

      if (!_sizeAllLabelView) {  // ATTENTION: TOTAL STRENGTH; NOT SIZE!!!
        _sizeAllLabelView = AWE.UI.createLabelView();
        _sizeAllLabelView.initWithControllerAndLabel(my.controller);
        _sizeAllLabelView.setFrame(AWE.Geometry.createRect(5, 90, 100, 24)); //105, 24, 100, 24));      
        _sizeAllLabelView.setTextAlign("left");
        _sizeAllLabelView.setIconImage("map/icon/fist");
        this.addChild(_sizeAllLabelView);
      }
      _sizeAllLabelView.setText(_army.get('strength'));
      
      if (!_sizeType1LabelView) {
        _sizeType1LabelView = AWE.UI.createLabelView();
        _sizeType1LabelView.initWithControllerAndLabel(my.controller);
        _sizeType1LabelView.setFrame(AWE.Geometry.createRect(105, 46, 100, 24));      
        _sizeType1LabelView.setTextAlign("left");
        _sizeType1LabelView.setIconImage("map/icon/army/infantry");
        this.addChild(_sizeType1LabelView);
      }
      _sizeType1LabelView.setText(Math.floor(_army.get('unitcategory_infantry_strength')));
      
      if (!_sizeType2LabelView) {
        _sizeType2LabelView = AWE.UI.createLabelView();
        _sizeType2LabelView.initWithControllerAndLabel(my.controller);
        _sizeType2LabelView.setFrame(AWE.Geometry.createRect(105, 68, 100, 24));      
        _sizeType2LabelView.setTextAlign("left");
        _sizeType2LabelView.setIconImage("map/icon/army/cavalry");
        this.addChild(_sizeType2LabelView);
      }
      _sizeType2LabelView.setText(Math.floor(_army.get('unitcategory_cavalry_strength')));
      
      if (!_sizeType3LabelView) {
        _sizeType3LabelView = AWE.UI.createLabelView();
        _sizeType3LabelView.initWithControllerAndLabel(my.controller);
        _sizeType3LabelView.setTextAlign("left");
        _sizeType3LabelView.setIconImage("map/icon/army/artillery");
        _sizeType3LabelView.setFrame(AWE.Geometry.createRect(105, 90, 100, 24));      
        this.addChild(_sizeType3LabelView);
      }
      _sizeType3LabelView.setText(Math.floor(_army.get('unitcategory_artillery_strength')));
      
      if (!_inspectorFrame) {
        _inspectorFrame = AWE.UI.createImageView();
        _inspectorFrame.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/inspector/frame"));
        _inspectorFrame.setFrame(AWE.Geometry.createRect(184, 0, 128, 128));
        _inspectorFrame.onClick = function() { 
          my.controller.moveTo(AWE.Map.Manager.getLocation(_army.get('location_id')));
        };  
        this.addChild(_inspectorFrame);
      }      
      
      if (!_stanceView || _army.get('stance') != _stance) {
        _stance = _army.get('stance');
        // Image view für held
        var stance = _army.get('stance') || 0;
        var offX = 12;
        var offY = 2;
              
        var stanceImage = null;
        if (_army.get("npc")) {
          var size = _army.get('size_present') || 0;
          if (size >= 800) {
            stanceImage = AWE.UI.ImageCache.getImage('map/army/npc/large');
          }
          else if (size >= 100) {
            stanceImage = AWE.UI.ImageCache.getImage('map/army/npc/medium');
          }
          else {
            stanceImage = AWE.UI.ImageCache.getImage('map/army/npc/small');
          }
        }
        else {
          stanceImage = AWE.UI.ImageCache.getImage(AWE.Config.MAP_STANCE_IMAGES[stance]);
        }        
      
        if (!_stanceView) { 
          _stanceView = AWE.UI.createImageView();
          _stanceView.initWithControllerAndImage(my.controller, stanceImage);
          _stanceView.setFrame(AWE.Geometry.createRect(186 + offX, 4 + offY, 96, 96));
          //_stanceView.onClick = that.onClick;
          _stanceView.onClick = function() {
            my.controller.moveTo(AWE.Map.Manager.getLocation(_army.get('location_id')));
          };  
          _stanceView.onMouseOver = that.onMouseOver;
          _stanceView.onMouseOut = that.onMouseOut;
          this.addChild(_stanceView);
        }
        else {
          _stanceView.setImage(stanceImage);
        }
      }

      var allianceId = _army.get('alliance_id')
      if (_flagView && _flagView.allianceId() !== allianceId) {      
        this.removeChild(_flagView);
        this.removeChild(_flagFrameView);
        _flagView = null;
        _flagFrameView = null;
      }
      if (!_flagView) {
        // Allicance Flag
        if (allianceId) {
          _flagView = AWE.UI.createAllianceFlagView();
          _flagView.initWithController(my.controller);
          _flagView.setFrame(AWE.Geometry.createRect(152, 3, 56, 74));
          _flagView.setAllianceId(allianceId);
          _flagView.setTagVisible(true);
          _flagView.onClick = function() { 
            if (that.onFlagClicked) {
              that.onFlagClicked(allianceId);
            };
          };
          this.addChildAt(_flagView, 10);
          
          _flagFrameView = AWE.UI.createImageView();
          _flagFrameView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/banner/small"));
          _flagFrameView.setFrame(AWE.Geometry.createRect(149, 0, 61, 78));
          _flagView.onClick = function() { 
            WACKADOO.activateAllianceController(allianceId);   
          }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
          this.addChildAt(_flagFrameView, 11);
          
        }
      }

      // buttons oben
      if (!_infoButtonView) {
        _infoButtonView = AWE.UI.createButtonView();
        _infoButtonView.initWithControllerTextAndImage(my.controller, 'Info', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        _infoButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        _infoButtonView.setFrame(AWE.Geometry.createRect(180, 0, 48, 48));
        _infoButtonView.onClick = function() {
           that.onInventoryButtonClick(_army) 
        };
        this.addChild(_infoButtonView);
      }
  
      if (!_reinforceButtonView && isOwnArmy) { 
        _reinforceButtonView = AWE.UI.createButtonView();
        _reinforceButtonView.initWithControllerTextAndImage(my.controller, 'Reinforce', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        _reinforceButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        _reinforceButtonView.setFrame(AWE.Geometry.createRect(268, 0, 48, 48));
        _reinforceButtonView.onClick = function() {
           that.onChangeArmyButtonClick(_army) 
        };
        this.addChild(_reinforceButtonView);
      }
      
      if (_reinforceButtonView && isOwnArmy) {
        var settlement = AWE.Map.Manager.getLocation(_army.get('location_id')).settlement();
        _reinforceButtonView.setEnabled(settlement && _army.get('home_settlement_id') === settlement.getId());
      }

/*
      if (!_prevButtonView && isOwnArmy) {
        // button unten
        _prevButtonView = AWE.UI.createButtonView();
        _prevButtonView.initWithControllerTextAndImage(my.controller, '<<', AWE.UI.ImageCache.getImage("map/button1"));
        _prevButtonView.setFrame(AWE.Geometry.createRect(180, 92, 36, 36));
        this.addChild(_prevButtonView);
      }
  
      if (!_nextButtonView && isOwnArmy) {
        _nextButtonView = AWE.UI.createButtonView();
        _nextButtonView.initWithControllerTextAndImage(my.controller, '>>', AWE.UI.ImageCache.getImage("map/button1"));
        _nextButtonView.setFrame(AWE.Geometry.createRect(280, 92, 36, 36));
        this.addChild(_nextButtonView);
      }*/
    }
    
  //  that.onInventoryButtonClick = function() { console.log('inventory button clicked'); }
    that.onChangeArmyButtonClick = function(army) { console.log('inventory button clicked'); }
        
    that.updateView = function() {
      that.recalcView();      
      _super.updateView();
    };   
    
    that.army = function() {
      return _army;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




