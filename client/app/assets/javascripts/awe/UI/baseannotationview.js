/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 /* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createBaseAnnotationView = function(spec, my) {
    
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

    that = module.createContainer(spec, my);
    
    that.onNewArmyButtonClick = null;
    
    my.typeName = 'BaseAnnotationView';
    my.baseView = null;
    my.location = null;
    my.infoContainer = null;
    
    my.settlementType = null;

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndView = function(controller, view, frame) {
      _super.initWithController(controller, frame);
      my.location = view.location();
      my.baseView = view;
      my.settlementType = AWE.Config.MAP_LOCATION_TYPE_CODES[my.location.settlementTypeId() || 2];
      my.frame.size.width = 192;
      my.frame.size.height = 128;      
    };
    
    that.updateButtonState = function() {
      if (attackButton) {
        attackButton.setSelected(_actionMode === 'attackTargetSelection');
        // log('-----> army', my.location.garrisonArmy(), !my.location.garrisonArmy().get('empty'), !my.location.garrisonArmy().get('isSuspended'));
        attackButton.setEnabled(my.location.garrisonArmy() && !my.location.garrisonArmy().get('empty') && !my.location.garrisonArmy().get('isSuspended'));
      }
    }

    that.recalcView = function() {
      
      var isOwnLocation =  my.location.isOwn();

      if (!enterButton && isOwnLocation) {
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
        enterButton.onClick = function() {
          that.onEnterButtonClick();
          AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_settlement_button2');
        }
        this.addChild(enterButton);
      }
      else if (enterButton && !isOwnLocation) {
        this.removeChild(enterButton);
        enterButton = null;
      }
      if (enterButton) {
        enterButton.setVisible(my.baseView.selected());
      }
      
      var battleCheck = false;
      if (!attackButton && isOwnLocation) { // check ongoing battle
        attackButton = AWE.UI.createButtonIconView();
        var backgrounds = {
          normal: AWE.UI.ImageCache.getImage("hud/annotation/button/background/red"),
          active: AWE.UI.ImageCache.getImage("hud/annotation/button/background/red/active")
        }
        var icons = {
          normal: AWE.UI.ImageCache.getImage("hud/annotation/button/attack/normal"),
          hover:  AWE.UI.ImageCache.getImage("hud/annotation/button/attack/hover"),
          active:  AWE.UI.ImageCache.getImage("hud/annotation/button/attack/hover")
        }
        attackButton.initWithControllerImageAndIcon(my.controller,
          backgrounds, 
          icons,
          AWE.Geometry.createRect(30, 110, 64, 64),
          AWE.UI.ImageCache.getImage("hud/annotation/activestate")
        );
        attackButton.onClick = function() { if (attackButton.enabled()) { that.onAttackButtonClick(that); } }
        this.addChild(attackButton);
      }
      else if (attackButton && !isOwnLocation) {
        this.removeChild(attackButton);
        attackButton = null;
      }
      if (attackButton) {
        attackButton.setVisible(my.baseView.selected());
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
          if (_battleInfoButtonView.enabled() && my.location.garrisonArmy()) {
            that.onBattleInfoButtonClick(my.location.garrisonArmy());
          }
        }
        this.addChild(_battleInfoButtonView);
      }      
      
      if (_battleInfoButtonView) {
        _battleInfoButtonView.setVisible(my.baseView.selected() && my.location.garrisonArmy() && my.location.garrisonArmy().get('isFighting'));
      }
      
      if (!_newArmyButtonView && isOwnLocation && my.location != null && my.location.garrisonArmy() != null && !my.location.garrisonArmy().get('isFighting')) {
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
            that.onNewArmyButtonClick(my.location);
          }
        };
        this.addChild(_newArmyButtonView);
      }
      if (_newArmyButtonView) {
        _newArmyButtonView.setVisible(my.baseView.selected());
      }

      if (_newArmyButtonView && isOwnLocation && my.location != null && my.location.garrisonArmy() != null && my.location.garrisonArmy().get('isFighting')) {
        this.removeChild(_newArmyButtonView);
      }

      this.updateButtonState();

      if (!my.infoContainer) {
        my.infoContainer = AWE.UI.createMultiLineContainer();
        my.infoContainer.initWithController(my.controller, AWE.Geometry.createRect(122,4,100,0));
        this.addChild(my.infoContainer);
      }
      
      if (!_infoText2View) {
        _infoText2View = AWE.UI.createLabelView();
        _infoText2View.initWithControllerAndLabel(my.controller);
        _infoText2View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText2View.setTextAlign("left");
        _infoText2View.setIconImage("map/icon/army/strength");
        my.infoContainer.addChild(_infoText2View);
      }
      
      if (!_infoText1View) {
        _infoText1View = AWE.UI.createLabelView();
        _infoText1View.initWithControllerAndLabel(my.controller);
        _infoText1View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText1View.setTextAlign("left");
        _infoText1View.setIconImage("map/icon/army/size");
        my.infoContainer.addChild(_infoText1View);
      }

      var settlement = my.location.settlement();
      _infoText1View.setText('' + (settlement ? settlement.get('score') : my.location.settlementScore()));
      _infoText2View.setText('' + (settlement ? Math.floor((settlement.get('present_defense_bonus') || 0)*100)+"%" : '-'));

      if (!_infoText4View && settlement && settlement.isOwn()) {
        _infoText4View = AWE.UI.createLabelView();
        _infoText4View.initWithControllerAndLabel(my.controller);
        _infoText4View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText4View.setTextAlign("left");
        my.infoContainer.addChild(_infoText4View);
      }

      if(_infoText4View && settlement && settlement.isOwn())
      {
        _infoText4View.setText(AWE.I18n.lookupTranslation('building.commandPointShort') + ': ' + (settlement.get('command_points') - settlement.get('commandPointsUsed')));
      }

      if (!_infoText3View && my.location.garrisonArmy() && my.location.garrisonArmy().get('isSuspended')) {
        _infoText3View = AWE.UI.createLabelView();
        _infoText3View.initWithControllerAndLabel(my.controller);
        _infoText3View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText3View.setTextAlign("left");
        _infoText3View.setIconImage("map/army/sandglass");
        my.infoContainer.addChild(_infoText3View);
      }
      if (_infoText3View) {
        _infoText3View.setText('' + Date.parseISODate(my.location.garrisonArmy().get('suspension_ends_at')).toString('HH:mm:ss'));
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
      return my.baseView;
    }
    
    that.setActionMode = function(actionMode) {
      _actionMode = actionMode;
    }        
    
    that.onEnterButtonClick = function() {
      WACKADOO.activateBaseController({
        locationId: my.location.id()
      });
    };
    

    that.onAttackButtonClick = function() {};

    that.onSpyButtonClick = function() {};

    that.onBattleButtonClick = function() {};
        
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));




