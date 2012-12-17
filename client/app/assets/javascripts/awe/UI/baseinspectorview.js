/* Authors: Patrick Fox <patrick@5dlab.com>,
 *          Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createBaseInspectorView = function(spec, my) {

    var that;

    my = my || {};
    
    my.typeName = 'BaseInspectorView';
    my.settlementType = null;
        
    var _nameLabelView = null;
    var _levelLabelView = null;
    var _newArmyButtonView = null;

    var _settlementView = null;

    
    that = module.createInspectorView(spec, my);

    var _super = {
      recalcView: AWE.Ext.superior(that, "recalcView"),
    };
    
    that.onFlagClicked = null;
    that.onPreviousSettlementButtonClick = null;
    that.onNextSettlementButtonClick = null;
    that.onNewArmyButtonClick = null;        
        
    /** overwritten view methods */
    
    that.initWithControllerAndLocation = function(controller, location, frame) {
      that.initWithControllerAndAllianceId(controller, location ? location.allianceId() : null, frame);      

      my.inspectedObject = location;         
      my.settlementType = AWE.Config.MAP_LOCATION_TYPE_CODES[location.settlementTypeId() || 2];
      
      that.recalcView();
    };
    
    that.onPreviousButtonClick  = function(location) {
      this.onPreviousSettlementButtonClick(location);
    }
    that.onNextButtonClick      = function(location) {
      this.onNextSettlementButtonClick(location);
    }
    
    that.recalcView = function() {
      
      var location      = my.inspectedObject;
      
      var allianceId    = location ? location.allianceId()  : null;
      var isOwnLocation = location.isOwn();
      
      this.setAllianceId(allianceId);
      this.setSkimButtonsEnabled(isOwnLocation);
      
      _super.recalcView();
      
      if (!_newArmyButtonView && isOwnLocation) {
        _newArmyButtonView = AWE.UI.createButtonView();
        _newArmyButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/inspector/button/reinforce/normal"));
        _newArmyButtonView.setImageForState(AWE.UI.ImageCache.getImage("hud/inspector/button/reinforce/hovered"), module.CONTROL_STATE_HOVERED);
        _newArmyButtonView.setFrame(AWE.Geometry.createRect(346, 0, 68, 66));
        _newArmyButtonView.onClick = function() {
          if (that.onNewArmyButtonClick) {
            that.onNewArmyButtonClick(location);
          }
        };
        this.addChildAt(_newArmyButtonView, 2);
      }
      
      if (!_nameLabelView) {
        _nameLabelView = AWE.UI.createLabelView();
        _nameLabelView.initWithControllerAndLabel(my.controller);
        _nameLabelView.setFrame(AWE.Geometry.createRect(5, 27, 100, 36));      
        _nameLabelView.setFont('24px "Helvetica Neue", Helvetica, Arial');
        _nameLabelView.setTextAlign("left");
        // _nameLabelView.setIconImage("map/icon/heads");
        this.addChild(_nameLabelView);
      }
      
      if (location.name() !== _nameLabelView.text()) {
        _nameLabelView.setText(location.name());
      }


      if (!_levelLabelView) {
        _levelLabelView = AWE.UI.createLabelView();
        _levelLabelView.initWithControllerAndLabel(my.controller);
        _levelLabelView.setFrame(AWE.Geometry.createRect(5, 68, 100, 24));      
        _levelLabelView.setTextAlign("left");
        _levelLabelView.setIconImage("map/icon/actionpoints");
        this.addChild(_levelLabelView);
      }
      if (location.settlementLevel() != _levelLabelView.text()) {
        _levelLabelView.setText(location.settlementLevel());
      }
                
      if (!_settlementView) {
        var level = AWE.Util.Rules.normalizedLevel(location.settlementLevel(), location.settlementTypeId());
        var imageName = null;
        
        if (my.settlementType === 'outpost') {
          imageName = "map/outpost"
        }
        else {
          if (level < 4) {
            modifier = "small";
          }
          else if (level < 8) {
            modifier = "middle";
          }
          else {
            modifier = "big";
          }
        
          imageName = "map/colony/" + modifier;
        }
                
        _settlementView = AWE.UI.createImageView();
        _settlementView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(imageName));
        _settlementView.setFrame(AWE.Geometry.createRect(30, 30, 64, 64));
        this.setInspectedObjectView(_settlementView);
      }

    }
    
    
    that.location = function() {
      return my.inspectedObject;
    };
   
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));





