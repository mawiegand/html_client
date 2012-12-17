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
    var _ownerLabelView = null;
    var _scoreLabelView = null;
    var _bonusLabelView = null;
    
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
        _nameLabelView.setFrame(AWE.Geometry.createRect(31, 30, 160, 36));      
        _nameLabelView.setFont('19px "Helvetica Neue", Helvetica, Arial');
        _nameLabelView.setTextAlign("left");
        this.addChild(_nameLabelView);
      }
      
      if (location.name() !== _nameLabelView.text()) {
        _nameLabelView.setText(location.name());
      }

      if (!_ownerLabelView) {
        _ownerLabelView = AWE.UI.createLabelView();
        _ownerLabelView.initWithControllerAndLabel(my.controller);
        _ownerLabelView.setFrame(AWE.Geometry.createRect(31, 55, 120, 24));      
        _ownerLabelView.setTextAlign("left");
        this.addChild(_ownerLabelView);
      }
      var owner = location.ownerName(); 
      if (_ownerLabelView.text() != owner) {
        _ownerLabelView.setText(owner);
      }
      
      
      if (!_scoreLabelView) {
        _scoreLabelView = AWE.UI.createLabelView();
        _scoreLabelView.initWithControllerAndLabel(my.controller);
        _scoreLabelView.setFrame(AWE.Geometry.createRect(31, 83, 100, 24));      
        _scoreLabelView.setTextAlign("left");
        _scoreLabelView.setIconImage("map/icon/army/size");
        this.addChild(_scoreLabelView);
      }
      if (location.settlementScore() != _scoreLabelView.text()) {
        _scoreLabelView.setText(location.settlementScore());
      }
      
      if (!_bonusLabelView) {
        _bonusLabelView = AWE.UI.createLabelView();
        _bonusLabelView.initWithControllerAndLabel(my.controller);
        _bonusLabelView.setTextAlign("left");
        _bonusLabelView.setIconImage("map/icon/army/strength");
        _bonusLabelView.setFrame(AWE.Geometry.createRect(162, 83, 100, 24));      
        this.addChild(_bonusLabelView);
      }
      _bonusLabelView.setText('' + (location.settlement() ? Math.floor((location.settlement().get('defense_bonus') || 0)*100)+"%" : '-'));

                
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





