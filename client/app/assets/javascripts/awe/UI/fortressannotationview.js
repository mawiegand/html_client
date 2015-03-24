/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  
  /*** AWE.UI.View ***/

  module.createFortressAnnotationView = function(spec, my) {
    
    var that = null;
    
    // selected
    var enterButton = null;    
    var attackButton = null;
    var battleButton = null;    
    var _battleInfoButtonView = null;
    
    var _newArmyButtonView = null;

    //  hovered
    var _infoText1View = null;    
    var _infoText2View = null;    
    var _infoText3View = null;
    var _infoText4View = null;

    var _backgroundShapeView = null;

    var rightOfWayIcon = null;
    
    var _actionMode = null;

    my = my || {};
    
    my.typeName = 'FortressAnnotationView';
    my.fortressView = null;
    my.region = null;
    my.infoContainer = null;

    that = module.createContainer(spec, my);
    
    that.onNewArmyButtonClick = null;

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };

    
    that.initWithControllerAndView = function(controller, view, frame) {
      _super.initWithController(controller, frame);
      my.region = view.node().region();
      my.fortressView = view;
      
      my.frame.size.width = 192;
      my.frame.size.height = 128;
    }
    
    that.updateButtonState = function() {
      if (attackButton) {
        attackButton.setSelected(_actionMode === 'attackTargetSelection');
        attackButton.setEnabled(my.region.location(0) && my.region.location(0).garrisonArmy() && !my.region.location(0).garrisonArmy().get('empty') && !my.region.location(0).garrisonArmy().get('isSuspended'));
      }
      
      if (_battleInfoButtonView) {        
        _battleInfoButtonView.setVisible(my.fortressView.selected() && my.region.location(0) && my.region.location(0).garrisonArmy() && my.region.location(0).garrisonArmy().get('isFighting'));
      }
    }
    
    that.recalcView = function() {
      
      var currentCharacter = AWE.GS.CharacterManager.getCurrentCharacter();
      var isOwnLocation = my.region.ownerId() === currentCharacter.get('id');

      if (!enterButton && my.region.ownerId() === currentCharacter.get('id')) {
        enterButton = AWE.UI.createButtonIconView();
        var backgrounds = {
          normal: AWE.UI.ImageCache.getImage("hud/annotation/button/background/blue")
        }
        var icons = {
          normal: AWE.UI.ImageCache.getImage("hud/annotation/button/enter/normal"),
          hover:  AWE.UI.ImageCache.getImage("hud/annotation/button/enter/hover")
        }
        enterButton.initWithControllerImageAndIcon(my.controller,
          backgrounds, 
          icons,
          AWE.Geometry.createRect(-10, 52, 64, 64)
        );
        enterButton.onClick = function() { that.onEnterButtonClick(); }
        this.addChild(enterButton);
      }
      else if (enterButton && my.region.ownerId() !== currentCharacter.get('id')) {
        this.removeChild(enterButton);
        enterButton = null;
      }
      if (enterButton) {
        enterButton.setVisible(my.fortressView.selected());
      }
      
      if (!attackButton && isOwnLocation) { // check ongoing battle
        attackButton = AWE.UI.createButtonIconView();
        var backgrounds = {
          normal: AWE.UI.ImageCache.getImage("hud/annotation/button/background/red")
        }
        var icons = {
          normal: AWE.UI.ImageCache.getImage("hud/annotation/button/attack/normal"),
          hover:  AWE.UI.ImageCache.getImage("hud/annotation/button/attack/hover")
        }
        attackButton.initWithControllerImageAndIcon(my.controller,
          backgrounds, 
          icons,
          AWE.Geometry.createRect(30, 110, 64, 64),
          AWE.UI.ImageCache.getImage("hud/annotation/activestate")
        );
        attackButton.onClick = function() {
          if (attackButton.enabled()) {
            that.onAttackButtonClick(that);
          }
        }
        this.addChild(attackButton);
      }
      else if (attackButton && !isOwnLocation) {
        this.removeChild(attackButton);
        attackButton = null;
      }
      if (attackButton) {
        attackButton.setVisible(my.fortressView.selected());
      }

//      if (!battleButton && 0) {  // ongoing battle -> attribute is missing in database ("mode")
//        battleButton = AWE.UI.createButtonView();
//        battleButton.initWithControllerTextAndImage(my.controller, AWE.I18n.lookupTranslation('map.button.battle'), AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
//        battleButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
//        battleButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/pressed"), module.CONTROL_STATE_SELECTED);
//        battleButton.setFrame(AWE.Geometry.createRect(12, 56, 52, 52));
//        battleButton.onClick = function() { that.onBattleButtonClick(); }
//        this.addChild(battleButton);
//      }
//      else if (battleButton && !0) {
//        this.removeChild(battleButton);
//        battleButton = null;
//      }
//      if (battleButton) {
//        battleButton.setVisible(my.fortressView.selected());
//      }
//

      if (!_newArmyButtonView && isOwnLocation && my.region.location(0) != null && my.region.location(0).garrisonArmy() != null && !my.region.location(0).garrisonArmy().get('isFighting')) {
        _newArmyButtonView = AWE.UI.createButtonIconView();
        var backgrounds = {
          normal: AWE.UI.ImageCache.getImage("hud/annotation/button/background/yellow")
        }
        var icons = {
          normal: AWE.UI.ImageCache.getImage("hud/icon/army"),
          hover:  AWE.UI.ImageCache.getImage("hud/icon/army/hover")
        }
        _newArmyButtonView.initWithControllerImageAndIcon(my.controller,
          backgrounds, 
          icons,
          AWE.Geometry.createRect(140, 52, 64, 64)
        );
        _newArmyButtonView.onClick = function() {
          if (that.onNewArmyButtonClick) {
            that.onNewArmyButtonClick(my.region.location(0));
          }
        };
        this.addChild(_newArmyButtonView);
      }
      if (_newArmyButtonView) {
        _newArmyButtonView.setVisible(my.fortressView.selected());
      }

      if (_newArmyButtonView && isOwnLocation && my.region.location(0) != null && my.region.location(0).garrisonArmy() != null && my.region.location(0).garrisonArmy().get('isFighting')) {
        this.removeChild(_newArmyButtonView);
      }

      if (!_battleInfoButtonView) {
        _battleInfoButtonView = AWE.UI.createButtonIconView();
        var backgrounds = {
          normal: AWE.UI.ImageCache.getImage("hud/annotation/button/background/blue")
        }
        var icons = {
          normal: AWE.UI.ImageCache.getImage("hud/icon/info"),
          hover:  AWE.UI.ImageCache.getImage("hud/icon/info/hover")
        }
        _battleInfoButtonView.initWithControllerImageAndIcon(my.controller,
          backgrounds, 
          icons,
          AWE.Geometry.createRect(-10, -18, 64, 64)
        );
        _battleInfoButtonView.onClick = function() {
          if (_battleInfoButtonView.enabled() && my.region.location(0) && my.region.location(0).garrisonArmy()) {
            that.onBattleInfoButtonClick(my.region.location(0).garrisonArmy());
          }
        }
        this.addChild(_battleInfoButtonView);
      }

      this.updateButtonState();


      if (!rightOfWayIcon) {
        rightOfWayIcon = AWE.UI.createImageView();
        rightOfWayIcon.initWithControllerAndImage(that, AWE.UI.ImageCache.getImage("map/army/target_background"));
        rightOfWayIcon.setFrame(AWE.Geometry.createRect(42, 87, 32, 32));
        rightOfWayIcon.setContentMode(module.setContentModeNone);
        this.addChild(rightOfWayIcon); 
      }
      
      if (my.region.location(0)) {
        var rightOfWay = currentCharacter.rightOfWayAt(my.region.location(0));
        if (rightOfWay !== 'loading') {
          if (rightOfWay) {
            rightOfWayIcon.setImage(AWE.UI.ImageCache.getImage("map/easement/yes"));
          }
          else {
            rightOfWayIcon.setImage(AWE.UI.ImageCache.getImage("map/easement/no"));
          }
        }
        else {
          AWE.GS.CharacterManager.updateCharacter(my.region.location(0).ownerId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function(){
            that.setNeedsUpdate();
          });          
        }
      }
      else {
        AWE.Map.Manager.fetchLocationsForRegion(my.region, function(){
          that.setNeedsUpdate();
        });
      }

      if (!my.infoContainer) {
        my.infoContainer = AWE.UI.createMultiLineContainer();
        my.infoContainer.initWithController(my.controller, AWE.Geometry.createRect(152,20,100,0));
        this.addChild(my.infoContainer);
      }
      
      if (!_infoText1View) {
        _infoText1View = AWE.UI.createLabelView();
        _infoText1View.initWithControllerAndLabel(my.controller);
        _infoText1View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText1View.setTextAlign("left");
        _infoText1View.setIconImage("map/icon/army/strength");
        my.infoContainer.addChild(_infoText1View);
      }
      var location = my.region.location(0);
      var settlement = location ? location.settlement() : null;
      _infoText1View.setText('' + (settlement ? Math.floor((settlement.get('present_defense_bonus') || 0)*100)+"%" : '-'));

      if (!_infoText3View) {
        _infoText3View = AWE.UI.createLabelView();
        _infoText3View.initWithControllerAndLabel(my.controller);
        _infoText3View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText3View.setTextAlign("left");
        _infoText3View.setIconImage("map/icon/army/size");
        my.infoContainer.addChild(_infoText3View);
      }
      _infoText3View.setText('' + (settlement ? settlement.get('score') : my.region.fortressScore()));

      if (!_infoText2View && my.region.location(0) && my.region.location(0).garrisonArmy() && my.region.location(0).garrisonArmy().get('isSuspended')) {
        _infoText2View = AWE.UI.createLabelView();
        _infoText2View.initWithControllerAndLabel(my.controller);
        _infoText2View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText2View.setTextAlign("left");
        _infoText2View.setIconImage("map/army/sandglass");
        my.infoContainer.addChild(_infoText2View);
      }
      if (_infoText2View) {
        _infoText2View.setText('' + Date.parseISODate(my.region.location(0).garrisonArmy().get('suspension_ends_at')).toString('HH:mm:ss'));
      }

      if (!_infoText4View && settlement && settlement.isOwn()) {
        _infoText4View = AWE.UI.createLabelView();
        _infoText4View.initWithControllerAndLabel(my.controller);
        _infoText4View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText4View.setTextAlign("left");
        my.infoContainer.addChild(_infoText4View);
      }
      if (_infoText4View) {
        if(settlement && !settlement.owner.npc && settlement.get('command_points') && settlement.get('commandPointsUsed') != null && settlement.isOwn())
        {
          _infoText4View.setText(AWE.I18n.lookupTranslation('building.commandPointShort') + ': ' + (settlement.get('command_points') - settlement.get('commandPointsUsed')));
        }
      }

      my.infoContainer.layoutSubviews(); 
       
       
      if (_backgroundShapeView) {
        this.removeChild(_backgroundShapeView);
      }
      
      var backgroundGraphics = new Graphics();
      backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundGraphics.drawRoundRect(0, 0,
                                       my.infoContainer.frame().size.width + 16,
                                       my.infoContainer.frame().size.height+ 16, 4);
      _backgroundShapeView = AWE.UI.createShapeView();
      _backgroundShapeView.initWithControllerAndGraphics(my.controller, backgroundGraphics);
      _backgroundShapeView.setFrame(AWE.Geometry.createRect(my.infoContainer.frame().origin.x - 8, 
                                                            my.infoContainer.frame().origin.y - 8, 
                                                            my.infoContainer.frame().size.width + 16, 
                                                            my.infoContainer.frame().size.height+ 16));
       
      this.addChildAt(_backgroundShapeView, 0); 
    }
    
    
    that.updateView = function() {
      this.recalcView();
      _super.updateView();
    }

    that.annotatedView = function() {
      return my.fortressView;
    }
    
    that.setActionMode = function(actionMode) {
      _actionMode = actionMode;
    }    
    
    // ACTIONS ///////////////////////////////////////////////////////////////
    
    that.onEnterButtonClick = function() {
      var reference = {};
      if (my.fortressView.location()) {
        reference.locationId = my.fortressView.location().id();
      }
      else {
        reference.node = my.fortressView.node();
      }
      
      WACKADOO.activateFortressController(reference); // TODO: pass fortress id
    };

    that.onAttackButtonClick = function() {};

    that.onSpyButtonClick = function() {};

    that.onBattleButtonClick = function() {};

    that.onBattleInfoButtonClick = function() {};
    
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));






