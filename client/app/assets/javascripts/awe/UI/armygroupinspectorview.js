/* Authors: Marcel Wiegand <marcel@5dlab.com>
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createArmyGroupInspectorView = function(spec, my) {

    var that;

    my = my || {};
    
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

    my.typeName = 'ArmyGroupInspectorView';

    var _super = {
      initWithControllerAndAllianceId: AWE.Ext.superior(that, "initWithControllerAndAllianceId"),
      layoutSubviews:                  AWE.Ext.superior(that, "layoutSubviews"),
      setFrame:                        AWE.Ext.superior(that, "setFrame"),
      updateView:                      AWE.Ext.superior(that, "updateView"),
      recalcView:                      AWE.Ext.superior(that, "recalcView"),
    };
    
    that.onFlagClicked = null;
    that.onPreviousArmyButtonClick = null;
    that.onNextArmyButtonClick = null;
    
    /** overwritten view methods */
    
    that.initWithControllerAndArmyGroup = function(controller, armyGroup, frame) {
      _super.initWithControllerAndAllianceId(controller, armyGroup[0] ? armyGroup[0].get('alliance_id') : null, frame);      
      
      my.inspectedObject = armyGroup;  
        
      /*that.onPreviousButtonClick  = function(army) {
        this.onPreviousArmyButtonClick(army);
      }
      that.onNextButtonClick      = function(army) {
        this.onNextArmyButtonClick(army);
      }*/
      
      that.recalcView();
    };
    
    that.recalcView = function() {
      
      var army       = my.inspectedObject[0];
      
      var allianceId = army ? army.get('alliance_id') : null;
      var isOwnArmy  = army ? army.isOwn() : false;
      
      this.setAllianceId(allianceId);
      this.setSkimButtonsEnabled(false);
      
      _super.recalcView();

      if (!_nameLabelView) {
        _nameLabelView = AWE.UI.createLabelView();
        _nameLabelView.initWithControllerAndLabel(my.controller);
        _nameLabelView.setFrame(AWE.Geometry.createRect(31, 25, 160, 36));      
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
        _apLabelView.setFrame(AWE.Geometry.createRect(31, 61, 100, 28));      
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
        _locationLabelView.setFrame(AWE.Geometry.createRect(31, 89, 100, 28));      
        _locationLabelView.setTextAlign("left");
        _locationLabelView.setIconImage("map/icon/home");
        this.addChild(_locationLabelView);
      }
      
      _locationLabelView.setText(army.get('home_settlement_name') ? army.get('home_settlement_name') : '[Home]');
      

      if (!_sizeAllLabelView) {  // ATTENTION: TOTAL STRENGTH; NOT SIZE!!!
        _sizeAllLabelView = AWE.UI.createLabelView();
        _sizeAllLabelView.initWithControllerAndLabel(my.controller);
        _sizeAllLabelView.setFrame(AWE.Geometry.createRect(31, 117, 100, 28)); //105, 24, 100, 24));      
        _sizeAllLabelView.setTextAlign("left");
        _sizeAllLabelView.setIconImage("map/icon/fist");
        this.addChild(_sizeAllLabelView);
      }
      _sizeAllLabelView.setText(army.get('strength'));
      
      if (_sizeType1LabelView == null) {
        _sizeType1LabelView = AWE.UI.createLabelView();
        _sizeType1LabelView.initWithControllerAndLabel(my.controller);
        _sizeType1LabelView.setFrame(AWE.Geometry.createRect(162, 61, 100, 28));      
        _sizeType1LabelView.setTextAlign("left");
        _sizeType1LabelView.setIconImage("map/icon/army/infantry");
        this.addChild(_sizeType1LabelView);
      }
      _sizeType1LabelView.setText(Math.floor(army.get('unitcategory_infantry_strength')).toString());
      
      if (_sizeType2LabelView == null) {
        _sizeType2LabelView = AWE.UI.createLabelView();
        _sizeType2LabelView.initWithControllerAndLabel(my.controller);
        _sizeType2LabelView.setFrame(AWE.Geometry.createRect(162, 89, 100, 28));      
        _sizeType2LabelView.setTextAlign("left");
        _sizeType2LabelView.setIconImage("map/icon/army/cavalry");
        this.addChild(_sizeType2LabelView);
      }
      _sizeType2LabelView.setText(Math.floor(army.get('unitcategory_cavalry_strength')).toString());
      
      if (_sizeType3LabelView == null) {
        _sizeType3LabelView = AWE.UI.createLabelView();
        _sizeType3LabelView.initWithControllerAndLabel(my.controller);
        _sizeType3LabelView.setTextAlign("left");
        _sizeType3LabelView.setIconImage("map/icon/army/artillery");
        _sizeType3LabelView.setFrame(AWE.Geometry.createRect(162, 117, 100, 28));      
        this.addChild(_sizeType3LabelView);
      }
      _sizeType3LabelView.setText(Math.floor(army.get('unitcategory_artillery_strength')).toString());
            
      if (!_stanceView || army.get('stance') != _stance) {
        _stance = army.get('stance');
        // Image view für held
        var stance = army.get('stance') || 0;
        var offX = 0;
        var offY = 0;
              
        var stanceImage = null;
        if (army.get("npc")) {
          var size = army.get('size_present') || 0;
          if (size >= 800) {
            stanceImage = AWE.UI.ImageCache.getImage('map/army/npc/stanceLarge');
          }
          else if (size >= 100) {
            stanceImage = AWE.UI.ImageCache.getImage('map/army/npc/stanceMedium');
          }
          else {
            stanceImage = AWE.UI.ImageCache.getImage('map/army/npc/stanceSmall');
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
      
        _stanceView = AWE.UI.createImageView();
        _stanceView.initWithControllerAndImage(my.controller, stanceImage);
        _stanceView.setFrame(AWE.Geometry.createRect(0 + offX, 0 + offY, 144, 144));
        this.setInspectedObjectView(_stanceView);
      }
    };

        
    that.armyGroup = function() {
      return my.inspectedObject;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));




