/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createArmyInspectorView = function(spec, my) {

    var that;

    my = my || {};
    
    var _army = null;
    var _stance = null;
    
    var _nameLabelView = null;
    var _apLabelView = null;
    var _locationLabelView = null;
    var _rankLabelView = null;
    
    var _sizeAllLabelView = null;
    var _sizeType1LabelView = null;
    var _sizeType2LabelView = null;
    var _sizeType3LabelView = null;
    
    var _stanceView = null;

    var _reinforceButtonView = null;
    
    that = module.createInspectorView(spec, my);

    my.typeName = 'ArmyInspectorView';

    var _super = {
      initWithControllerAndAllianceId: AWE.Ext.superior(that, "initWithControllerAndAllianceId"),
      layoutSubviews:                  AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:                        AWE.Ext.superior(that, "setFrame"),
      updateView:                      AWE.Ext.superior(that, "updateView"),
      recalcView:                      AWE.Ext.superior(that, "recalcView"),
    };
    
    that.onFlagClicked = null;
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmy = function(controller, army, frame) {
      _super.initWithControllerAndAllianceId(controller, army ? army.get('alliance_id') : null, frame);      
      
      my.inspectedObject = army;  
        
      that.onPreviousButtonClick  = function(army) {
        this.onPreviousArmyButtonClick(army);
      }
      that.onNextButtonClick      = function(army) {
        this.onNextArmyButtonClick(army);
      }
      
      that.recalcView();
    };
    
    that.recalcView = function() {
      
      var army       = my.inspectedObject;
      
      var allianceId = army ? army.get('alliance_id') : null;
      var isOwnArmy  = army ? army.isOwn() : false;
      
      this.setAllianceId(allianceId);
      this.setSkimButtonsEnabled(isOwnArmy);
      
      _super.recalcView();

      if (!_nameLabelView) {
        _nameLabelView = AWE.UI.createLabelView();
        _nameLabelView.initWithControllerAndLabel(my.controller);
        _nameLabelView.setFrame(AWE.Geometry.createRect(5, 15, 100, 36));      
        _nameLabelView.setFont('24px "Helvetica Neue", Helvetica, Arial');
        _nameLabelView.setTextAlign("left");
        // _nameLabelView.setIconImage("map/icon/heads");
        this.addChild(_nameLabelView);
      }
      
      if (army.get('name') !== _nameLabelView.text()) {
        _nameLabelView.setText(army.get('name'));
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
        var apNext = army.get('ap_next');
        _apLabelView.setText('AP: ' + (apNext ? AWE.Util.localizedTime(apNext, true) : "-")); // AWE.UI.Util.secondsToString(army.get('ap_seconds_per_point')));
      }
      else {
        _apLabelView.setText(army.get('owner_name') + (army.get('alliance_tag') ? ' | ' + army.get('alliance_tag') : ''));        
      }
      

      if (!_locationLabelView) {
        _locationLabelView = AWE.UI.createLabelView();
        _locationLabelView.initWithControllerAndLabel(my.controller);
        _locationLabelView.setFrame(AWE.Geometry.createRect(5, 68, 100, 24));      
        _locationLabelView.setTextAlign("left");
        _locationLabelView.setIconImage("map/icon/home");
        this.addChild(_locationLabelView);
      }
      
      _locationLabelView.setText(army.get('home_settlement_name') ? army.get('home_settlement_name') : '[Home]');
      

      if (!_sizeAllLabelView) {  // ATTENTION: TOTAL STRENGTH; NOT SIZE!!!
        _sizeAllLabelView = AWE.UI.createLabelView();
        _sizeAllLabelView.initWithControllerAndLabel(my.controller);
        _sizeAllLabelView.setFrame(AWE.Geometry.createRect(5, 90, 100, 24)); //105, 24, 100, 24));      
        _sizeAllLabelView.setTextAlign("left");
        _sizeAllLabelView.setIconImage("map/icon/fist");
        this.addChild(_sizeAllLabelView);
      }
      _sizeAllLabelView.setText(army.get('strength'));
      
      if (!_sizeType1LabelView) {
        _sizeType1LabelView = AWE.UI.createLabelView();
        _sizeType1LabelView.initWithControllerAndLabel(my.controller);
        _sizeType1LabelView.setFrame(AWE.Geometry.createRect(105, 46, 100, 24));      
        _sizeType1LabelView.setTextAlign("left");
        _sizeType1LabelView.setIconImage("map/icon/army/infantry");
        this.addChild(_sizeType1LabelView);
      }
      _sizeType1LabelView.setText(Math.floor(army.get('unitcategory_infantry_strength')));
      
      if (!_sizeType2LabelView) {
        _sizeType2LabelView = AWE.UI.createLabelView();
        _sizeType2LabelView.initWithControllerAndLabel(my.controller);
        _sizeType2LabelView.setFrame(AWE.Geometry.createRect(105, 68, 100, 24));      
        _sizeType2LabelView.setTextAlign("left");
        _sizeType2LabelView.setIconImage("map/icon/army/cavalry");
        this.addChild(_sizeType2LabelView);
      }
      _sizeType2LabelView.setText(Math.floor(army.get('unitcategory_cavalry_strength')));
      
      if (!_sizeType3LabelView) {
        _sizeType3LabelView = AWE.UI.createLabelView();
        _sizeType3LabelView.initWithControllerAndLabel(my.controller);
        _sizeType3LabelView.setTextAlign("left");
        _sizeType3LabelView.setIconImage("map/icon/army/artillery");
        _sizeType3LabelView.setFrame(AWE.Geometry.createRect(105, 90, 100, 24));      
        this.addChild(_sizeType3LabelView);
      }
      _sizeType3LabelView.setText(Math.floor(army.get('unitcategory_artillery_strength')));
            
      if (!_stanceView || army.get('stance') != _stance) {
        _stance = army.get('stance');
        // Image view für held
        var stance = army.get('stance') || 0;
        var offX = 12;
        var offY = 2;
              
        var stanceImage = null;
        if (army.get("npc")) {
          var size = army.get('size_present') || 0;
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
          var armyCategory = army.get('armyCategory');
          var stanceImages = AWE.Config.MAP_STANCE_IMAGES;
      
          if (armyCategory === 'artillery') {
            stanceImages = AWE.Config.MAP_STANCE_IMAGES_AMAZON;
          }
          else if (armyCategory === 'cavalry') {
            stanceImages = AWE.Config.MAP_STANCE_IMAGES_CHEF;
          }
          stanceImage = AWE.UI.ImageCache.getImage(stanceImages[stance]);
        }        
      
        if (!_stanceView) { 
          _stanceView = AWE.UI.createImageView();
          _stanceView.initWithControllerAndImage(my.controller, stanceImage);
          _stanceView.setFrame(AWE.Geometry.createRect(186 + offX, 4 + offY, 96, 96));
          //_stanceView.onClick = that.onClick;
          _stanceView.onClick = function() { 
            that.onCenterButtonClick();
          };
          _stanceView.onMouseOver = that.onMouseOver;
          _stanceView.onMouseOut = that.onMouseOut;
          this.addChild(_stanceView);
        }
        else {
          _stanceView.setImage(stanceImage);
        }
      }
      
      if (!_reinforceButtonView && isOwnArmy) { 
        _reinforceButtonView = AWE.UI.createButtonView();
        _reinforceButtonView.initWithControllerTextAndImage(my.controller, AWE.I18n.lookupTranslation('map.button.reinforce'), AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        _reinforceButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        _reinforceButtonView.setFrame(AWE.Geometry.createRect(268, 0, 48, 48));
        _reinforceButtonView.onClick = function() {
          if (that.onChangeArmyButtonClick) {
            that.onChangeArmyButtonClick(army); 
          }
        };
        this.addChild(_reinforceButtonView);
      }

      
      if (_reinforceButtonView && isOwnArmy) {
        var location = AWE.Map.Manager.getLocation(army.get('location_id'));
        var settlement = location ? location.settlement() : null;
        var garrison = settlement ? settlement.getPath('garrison') : null;
        _reinforceButtonView.setEnabled(settlement && garrison !== undefined && 
                                        garrison !== null && !garrison.get('isFighting') &&
                                        army.get('home_settlement_id') === settlement.getId() &&
                                        army.get('mode') === 0);
      }


    }
    
        
    that.army = function() {
      return my.inspectedObject;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




