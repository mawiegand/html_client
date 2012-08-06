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
    var spyButton = null;    
    var attackButton = null;    
    var battleButton = null;    

    //  hovered
    var _infoText1View = null;    
    var _infoText2View = null;    

    var _backgroundShapeView = null;

    var rightOfWayIcon = null;

    var _actionMode = null;

    my = my || {};

    that = module.createContainer(spec, my);
    
    my.typeName = 'BaseAnnotationView';
    my.baseView = null;
    my.location = null;
    my.infoContainer = null;

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
      
      my.frame.size.width = 192;
      my.frame.size.height = 128;      
    };
    
    that.updateButtonState = function() {
      if (attackButton) {
        attackButton.setSelected(_actionMode === 'attackTargetSelection');
      }
    }

    that.recalcView = function() {
      
      var currentCharacter = AWE.GS.CharacterManager.getCurrentCharacter();
      var isOwnLocation =  my.location.isOwn();
      var isOwnAlliance = my.location.allianceId() === AWE.GS.CharacterManager.currentCharacter.get('alliance_id');

      
      if (!enterButton && isOwnLocation) {
        enterButton = AWE.UI.createButtonView();
        enterButton.initWithControllerTextAndImage(my.controller, 'enter', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        enterButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        enterButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/pressed"), module.CONTROL_STATE_SELECTED);
        enterButton.setFrame(AWE.Geometry.createRect(12, 0, 52, 52));
        enterButton.onClick = function() { that.onEnterButtonClick(); }
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
      if (!attackButton && isOwnLocation && !battleCheck) { // check ongoing battle
        attackButton = AWE.UI.createButtonView();
        attackButton.initWithControllerTextAndImage(my.controller, 'attack', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        attackButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        attackButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/pressed"), module.CONTROL_STATE_SELECTED);
        attackButton.setFrame(AWE.Geometry.createRect(12, 56, 52, 52));
        attackButton.onClick = function() { if (attackButton.enabled()) { that.onAttackButtonClick(that); } }
        this.addChild(attackButton);
      }
      else if (attackButton && !isOwnLocation && !battleCheck) {
        this.removeChild(attackButton);
        attackButton = null;
      }
      if (attackButton) {
        attackButton.setVisible(my.baseView.selected());
      }
      
      /*
      if (!spyButton && !isOwnLocation) {
        spyButton = AWE.UI.createButtonView();
        spyButton.initWithControllerTextAndImage(my.controller, 'spy', AWE.UI.ImageCache.getImage("map/button1"));
        spyButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        spyButton.setImageForState(AWE.UI.ImageCache.getImage("map/button1highlighted"), module.CONTROL_STATE_SELECTED);
        spyButton.setFrame(AWE.Geometry.createRect(12, 0, 52, 52));
        spyButton.onClick = function() { that.onSpyButtonClick(); }
        this.addChild(spyButton);
      }
      else if (spyButton && isOwnLocation) {
        this.removeChild(spyButton);
        spyButton = null;
      }
      if (spyButton) {
        spyButton.setVisible(my.baseView.selected());
      } */
      
      if (!battleButton && battleCheck) {  // ongoing battle -> attribute is missing in database ("mode")
        battleButton = AWE.UI.createButtonView();
        battleButton.initWithControllerTextAndImage(my.controller, 'battle', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        battleButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        battleButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/pressed"), module.CONTROL_STATE_SELECTED);
        battleButton.setFrame(AWE.Geometry.createRect(12, 56, 52, 52));
        battleButton.onClick = function() { that.onBattleButtonClick(); }
        this.addChild(battleButton);
      }
      else if (battleButton && !battleCheck) {
        this.removeChild(battleButton);
        battleButton = null;
      }  
      if (battleButton) {
        battleButton.setVisible(my.baseView.selected());
      }    

      this.updateButtonState();

      if (!isOwnLocation && !rightOfWayIcon) {
        rightOfWayIcon = AWE.UI.createImageView();
        rightOfWayIcon.initWithControllerAndImage(that, AWE.UI.ImageCache.getImage("map/easement/no"));
        rightOfWayIcon.setFrame(AWE.Geometry.createRect(56, 82, 32, 32));
        rightOfWayIcon.setContentMode(module.setContentModeNone);
        this.addChild(rightOfWayIcon); 
      }
      else if (isOwnLocation && rightOfWayIcon) {
        this.removeChild(rightOfWayIcon);
        rightOfWayIcon = null;
      }        

      if (!my.infoContainer) {
        my.infoContainer = AWE.UI.createMultiLineContainer();
        my.infoContainer.initWithController(my.controller, AWE.Geometry.createRect(122,4,100,0));
        this.addChild(my.infoContainer);
      }
      
      if (!_infoText1View) {
        _infoText1View = AWE.UI.createLabelView();
        _infoText1View.initWithControllerAndLabel(my.controller);
        _infoText1View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText1View.setTextAlign("left");
        _infoText1View.setIconImage("map/icon/army/size");
        my.infoContainer.addChild(_infoText1View);
      }
      _infoText1View.setText('' + my.location.settlementLevel());
      
      if (!_infoText2View) {
        _infoText2View = AWE.UI.createLabelView();
        _infoText2View.initWithControllerAndLabel(my.controller);
        _infoText2View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText2View.setTextAlign("left");
        _infoText2View.setIconImage("map/icon/army/strength");
        my.infoContainer.addChild(_infoText2View);
      }
      var settlement = my.location.settlement();
      _infoText2View.setText('' + (settlement ? Math.floor((settlement.defense_bonus || 0)*100) : '-'));

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




