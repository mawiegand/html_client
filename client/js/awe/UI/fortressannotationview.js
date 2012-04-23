/* Authors: Patrick Fox <patrick@5dlab.com>, 
 *          Sascha Lange <sascha@5dlab.com>, Julian Schmid
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
    var spyButton = null;    
    var attackButton = null;    
    var battleButton = null;    


    //  hovered
    var _infoText1View = null;    
    var _infoText2View = null;    
    var _infoText3View = null;

    var _backgroundShapeView = null;

    my = my || {};
    
    my.typeName = 'FortressAnnotationView';
    my.fortressView = null;
    my.region = null;
    my.infoContainer = null;

    that = module.createContainer(spec, my);

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

    
    that.recalcView = function() {
      
      var currentCharacter = AWE.GS.CharacterManager.getCurrentCharacter();
      
      if (!enterButton && my.region.ownerId() === currentCharacter.get('id')) {
        enterButton = AWE.UI.createButtonView();
        enterButton.initWithControllerTextAndImage(my.controller, 'enter', AWE.UI.ImageCache.getImage("map/button1"));
        enterButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        enterButton.setImageForState(AWE.UI.ImageCache.getImage("map/button1highlighted"), module.CONTROL_STATE_SELECTED);
        enterButton.setFrame(AWE.Geometry.createRect(12, 0, 52, 52));
        enterButton.onClick = function() { that.onEnterButtonClick(); }
        this.addChild(enterButton);
      }
      else if (enterButton && my.region.ownerId() !== currentCharacter.get('id')) {
        this.removeChild(enterButton);
        enterButton = null;
      }
      
      if (!attackButton && my.region.ownerId() === currentCharacter.get('id') && !0) { // check ongoing battle
        attackButton = AWE.UI.createButtonView();
        attackButton.initWithControllerTextAndImage(my.controller, 'attack', AWE.UI.ImageCache.getImage("map/button1"));
        attackButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        attackButton.setImageForState(AWE.UI.ImageCache.getImage("map/button1highlighted"), module.CONTROL_STATE_SELECTED);
        attackButton.setFrame(AWE.Geometry.createRect(12, 56, 52, 52));
        attackButton.onClick = function() { that.onAttackButtonClick(); }
        this.addChild(attackButton);
      }
      else if (attackButton && my.region.ownerId() !== currentCharacter.get('id') && !0) {
        this.removeChild(attackButton);
        attackButton = null;
      }
      
      if (!spyButton && my.region.ownerId() !== currentCharacter.get('id')) {
        spyButton = AWE.UI.createButtonView();
        spyButton.initWithControllerTextAndImage(my.controller, 'spy', AWE.UI.ImageCache.getImage("map/button1"));
        spyButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        spyButton.setImageForState(AWE.UI.ImageCache.getImage("map/button1highlighted"), module.CONTROL_STATE_SELECTED);
        spyButton.setFrame(AWE.Geometry.createRect(12, 0, 52, 52));
        spyButton.onClick = function() { that.onSpyButtonClick(); }
        this.addChild(spyButton);
      }
      else if (spyButton && my.region.ownerId() === currentCharacter.get('id')) {
        this.removeChild(spyButton);
        spyButton = null;
      }
      
      if (!battleButton && 0) {  // ongoing battle -> attribute is missing in database ("mode")
        battleButton = AWE.UI.createButtonView();
        battleButton.initWithControllerTextAndImage(my.controller, 'battle', AWE.UI.ImageCache.getImage("map/button1"));
        battleButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        battleButton.setImageForState(AWE.UI.ImageCache.getImage("map/button1highlighted"), module.CONTROL_STATE_SELECTED);
        battleButton.setFrame(AWE.Geometry.createRect(12, 56, 52, 52));
        battleButton.onClick = function() { that.onBattleButtonClick(); }
        this.addChild(battleButton);
      }
      else if (battleButton && !0) {
        this.removeChild(battleButton);
        battleButton = null;
      }      

      if (!my.infoContainer) {
        my.infoContainer = AWE.UI.createMultiLineContainer();
        my.infoContainer.initWithController(my.controller, AWE.Geometry.createRect(124,0,100,0));
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
      _infoText1View.setText('120 %');
      
      if (!_infoText2View) {
        _infoText2View = AWE.UI.createLabelView();
        _infoText2View.initWithControllerAndLabel(my.controller);
        _infoText2View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText2View.setTextAlign("left");
        _infoText2View.setIconImage("map/display/icon");
        my.infoContainer.addChild(_infoText2View);
      }
      _infoText2View.setText('Relation');

      if (!_infoText3View) {
        _infoText3View = AWE.UI.createLabelView();
        _infoText3View.initWithControllerAndLabel(my.controller);
        _infoText3View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
        _infoText3View.setTextAlign("left");
        _infoText3View.setIconImage("map/icon/army/size");
        my.infoContainer.addChild(_infoText3View);
      }
      _infoText3View.setText('' + my.region.fortressLevel());

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

    that.layoutSubviews = function() {
      _super.layoutSubviews();
    }

        
    that.locationView = function() {
      return my.fortressView;
    }
    
    
    // ACTIONS ///////////////////////////////////////////////////////////////
    
    that.onEnterButtonClick = function() {};

    that.onAttackButtonClick = function() {};

    that.onSpyButtonClick = function() {};

    that.onBattleButtonClick = function() {};

    
    return that;
  };

    
  return module;
    
}(AWE.UI || {}));






