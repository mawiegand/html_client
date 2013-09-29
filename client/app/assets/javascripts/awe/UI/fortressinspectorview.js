/* Author: Patrick Fox <patrick@5dlab.com>
 *         Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createFortressDetailView = function(spec, my) {

    var that;

    var ownerLabelView = null;
    var allianceLabelView = null;
    
    // neu
    var _nameLabelView = null;
    var _ownerLabelView = null;
    var _pathLabelView = null;

    var _apLabelView        = null;
    var _locationLabelView  = null;
    var _rankLabelView      = null;
    var _sizeAllLabelView   = null;
    var _sizeType1LabelView = null;
    var _sizeType2LabelView = null;
    var _sizeType3LabelView = null;
    
    var _newArmyButtonView = null;
    
    var _fortressImageName = null;


    my = my || {};

    my.node = null;
    
    my.fortressView = null;
    my.fortressFlagView = null;

    that = module.createInspectorView(spec, my);

    that.onFlagClicked = null;
    that.onPreviousSettlementButtonClick = null;
    that.onNextSettlementButtonClick = null;
    that.onNewArmyButtonClick = null;

    var _super = {
      recalcView: AWE.Ext.superior(that, "recalcView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndNode = function(controller, node, frame) {
      that.initWithControllerAndAllianceId(controller, node ? node.region() : null, frame);      
      
      my.node            = node;
      my.inspectedObject = node.region();

      this.recalcView();
    };
    
    var callWithFortressLocation = function(f, region) {
      if (region && region.location(0)) {
        f(region.location(0));
      }
      else if (region) {
        AWE.Map.Manager.fetchLocationsForRegion(region, function() {
          if (region.location(0)) {
            f(region.location(0));
          }
        });
      }
    }
    
    that.onPreviousButtonClick  = function(region) {
      if (this.onPreviousSettlementButtonClick) {
        callWithFortressLocation(function(self) {  // wrap in function to keep context with this
          return function(location) {
            self.onPreviousSettlementButtonClick(location);
          };
        }(this), region);
      }
    }
    
    that.onNextButtonClick  = function(region) {
      if (this.onNextSettlementButtonClick) {
        callWithFortressLocation(function(self) {  // wrap in function to keep context with this
          return function(location) {
            self.onNextSettlementButtonClick(location);
          };
        }(this), region);
      }
    }    
    
    that.recalcView = function() {
      
      var currentCharacter = AWE.GS.CharacterManager.currentCharacter;
      var region           = my.inspectedObject;

      var allianceId       = region ? region.allianceId()  : null;
      var allianceColor    = region ? region.allianceColor()  : null;
      var isOwnRegion      = region.isOwn();

      this.setAllianceId(allianceId);
      this.setAllianceColor(allianceColor);
      this.setSkimButtonsEnabled(isOwnRegion);
      
      _super.recalcView();
      
      if (!_newArmyButtonView && isOwnRegion && region.location(0) != null && region.location(0).garrisonArmy() != null && !region.location(0).garrisonArmy().get('isFighting')) {
        _newArmyButtonView = AWE.UI.createButtonView();
        _newArmyButtonView.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/inspector/button/reinforce/normal"));
        _newArmyButtonView.setImageForState(AWE.UI.ImageCache.getImage("hud/inspector/button/reinforce/hovered"), module.CONTROL_STATE_HOVERED);
        _newArmyButtonView.setFrame(AWE.Geometry.createRect(346, 0, 68, 66));
        _newArmyButtonView.onClick = function() {
          if (that.onNewArmyButtonClick) {
            that.onNewArmyButtonClick(region);
          }
        };
        this.addChildAt(_newArmyButtonView, 2);
      }
      
      if (!_nameLabelView) {
        _nameLabelView = AWE.UI.createLabelView();
        _nameLabelView.initWithControllerAndLabel(my.controller);
        _nameLabelView.setFont('19px "Helvetica Neue", Helvetica, Arial');
        _nameLabelView.setFrame(AWE.Geometry.createRect(31, 30, 160, 36));      
        _nameLabelView.setTextAlign("left");
        this.addChild(_nameLabelView);
      }
      var name = region.name();
      if (_nameLabelView.text() != name) {
        _nameLabelView.setText(name);
      }
      
      if (!_ownerLabelView) {
        _ownerLabelView = AWE.UI.createLabelView();
        _ownerLabelView.initWithControllerAndLabel(my.controller);
        _ownerLabelView.setFrame(AWE.Geometry.createRect(31, 55, 120, 24));      
        _ownerLabelView.setTextAlign("left");
        this.addChild(_ownerLabelView);
      }
      var owner = region.ownerName(); // + (region.allianceId() > 0 ? ' | ' + region.allianceTag() : '');
      if (_ownerLabelView.text() != owner) {
        _ownerLabelView.setText(owner);
      }
      
      if (!_pathLabelView) {
        _pathLabelView = AWE.UI.createLabelView();
        _pathLabelView.initWithControllerAndLabel(my.controller);
        _pathLabelView.setFrame(AWE.Geometry.createRect(150, 55, 60, 24));      
        _pathLabelView.setTextAlign("right");
        _pathLabelView.setColor('rgb(190,190,190)');
        this.addChild(_pathLabelView);
      }
      if (_pathLabelView.text() != '('+my.node.path()+')') {
        _pathLabelView.setText('('+my.node.path()+')');
      }

      var settlement = region && region.location(0) ? region.location(0).settlement() : null;

      if (!_apLabelView) {
        _apLabelView = AWE.UI.createLabelView();
        _apLabelView.initWithControllerAndLabel(my.controller);
        _apLabelView.setFrame(AWE.Geometry.createRect(31, 83, 100, 24));      
        _apLabelView.setTextAlign("left");
        _apLabelView.setIconImage("map/icon/actionpoints");
        this.addChild(_apLabelView);
      }
      _apLabelView.setText('Steuer: ' + (settlement ? Math.floor((settlement.tax_rate || 0)*100)+"%" : '-'));


      if (!_rankLabelView) {
        _rankLabelView = AWE.UI.createLabelView();
        _rankLabelView.initWithControllerAndLabel(my.controller);
        _rankLabelView.setTextAlign("left");
        _rankLabelView.setIconImage("map/icon/army/strength");
        _rankLabelView.setFrame(AWE.Geometry.createRect(162, 83, 100, 24));      
        this.addChild(_rankLabelView);
      }
      _rankLabelView.setText('' + (settlement ? Math.floor((settlement.get('present_defense_bonus') || 0)*100)+"%" : '-'));

      
      
      // FORTRESS IMAGE //////////////////////////////////////////////////////
      var level = AWE.Util.Rules.normalizedLevel(region.fortressLevel(), AWE.GS.SETTLEMENT_TYPE_FORTRESS);
      var imageId = region.imageId();

      var newFortressImageName = imageId > 0 ? 'map/fortress/' + imageId + '/small' : 'map/fortress/small';
      if (level > 3) {
        newFortressImageName = imageId > 0 ? 'map/fortress/' + imageId + '/middle' : 'map/fortress/middle';
      }
      if (level > 7) {
        newFortressImageName = imageId > 0 ? 'map/fortress/' + imageId + '/large' : 'map/fortress/large';
      }

      if (newFortressImageName != _fortressImageName && my.fortressView) {
        my.container.removeChild(my.fortressView);
        my.fortressView = null;
      }
      _fortressImageName = newFortressImageName;

      if (!my.fortressView) {
        var container = AWE.UI.createContainer();
        container.initWithController(my.controller);
        container.setFrame(AWE.Geometry.createRect(0,0,144,144));
        
        my.fortressView = AWE.UI.createImageView();
        my.fortressView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(_fortressImageName));
        my.fortressView.setFrame(AWE.Geometry.createRect(32, 36, AWE.Config.MAPPING_FORTRESS_SIZE*1.2, AWE.Config.MAPPING_FORTRESS_SIZE*1.2));
        
        container.addChild(my.fortressView);
        
      
        // FORTRESS FLAG ///////////////////////////////////////////////////////////    
        
        my.fortressFlagView = AWE.UI.createAllianceFlagView();
        my.fortressFlagView.initWithController(my.controller);
        my.fortressFlagView.setFrame(AWE.Geometry.createRect(65, 60, 12, 20));
        my.fortressFlagView.setDirection('down');
        my.fortressFlagView.setAllianceId(allianceId);
        my.fortressFlagView.setAllianceColor(allianceColor);
        container.addChild(my.fortressFlagView);
        
        this.setInspectedObjectView(container);
      }
      
      if (my.fortressFlagView && allianceId != my.fortressFlagView.allianceId()) {
        my.fortressFlagView.setAllianceId(allianceId);
        my.fortressFlagView.setAllianceColor(allianceColor);
      }
    }
        
    that.region = function() {
      return my.inspectedObject;
    }
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));









