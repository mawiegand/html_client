/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createArmyAnnotationView = function(spec, my) {
        
    var that;
        
    var _army = null;
    var _armyView = null;
    
    var _actionMode = null;
        
    // selected
    var _stanceButtonView = null;    
    var _moveButtonView = null;    
    var _attackButtonView = null;    
    var _retreatButtonView = null;    
    var _battleInfoButtonView = null;    
    var _cancelButtonView = null;    
    var _rankImageView = null;   
    
    var _backgroundShapeView = null;
    var _infoText1View = null;    
    var _infoText2View = null;    
    var _infoText3View = null;    
    
    var infoContainer = null;  
    
    my = my || {};
    
    my.typeName = 'ArmyAnnotationView';
 

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      layoutSubviews: AWE.Ext.superior(that, "layoutSubviews"),
      updateView: AWE.Ext.superior(that, "updateView"),
      setFrame: AWE.Ext.superior(that, "setFrame"),
      setHovered: AWE.Ext.superior(that, "setHovered"),
    };
    
    /** overwritten view methods */
    
    that.initWithControllerAndView = function(controller, view, frame) {
      _super.initWithController(controller, frame);
      _armyView = view;
      _army = view.army();
      
      _stanceButtonView = AWE.UI.createButtonView();
      _stanceButtonView.initWithControllerTextAndImage(controller, 'Stance', AWE.UI.ImageCache.getImage("map/button1"), frame);
//    _stanceButtonView.setDisabledImage(AWE.UI.ImageCache.getImage("map/button1disabled"));
      _stanceButtonView.setFrame(AWE.Geometry.createRect(12, 6, 52, 52));
      this.addChild(_stanceButtonView);

      _moveButtonView = AWE.UI.createButtonView();
      _moveButtonView.initWithControllerTextAndImage(controller, 'Move', AWE.UI.ImageCache.getImage("map/button1"));
      _moveButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
      _moveButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button1highlighted"), module.CONTROL_STATE_SELECTED);
      _moveButtonView.setFrame(AWE.Geometry.createRect(12, 70, 52, 52));
      _moveButtonView.onClick = function() { if (_moveButtonView.enabled()) { that.onMoveButtonClick(that); } }
      this.addChild(_moveButtonView);
      
      _cancelButtonView = AWE.UI.createButtonView();
      _cancelButtonView.initWithControllerTextAndImage(controller, 'Cancel', AWE.UI.ImageCache.getImage("map/button1"));
      _cancelButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
      _cancelButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button1highlighted"), module.CONTROL_STATE_SELECTED);
      _cancelButtonView.setFrame(AWE.Geometry.createRect(12, 70, 52, 52));
      _cancelButtonView.onClick = function() { if (_cancelButtonView.enabled()) { that.onCancelMoveButtonClick(that); } }
      this.addChild(_cancelButtonView);      
      
      _attackButtonView = AWE.UI.createButtonView();
      _attackButtonView.initWithControllerTextAndImage(controller, 'Attack', AWE.UI.ImageCache.getImage("map/button1"));
      _attackButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
      _attackButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button1highlighted"), module.CONTROL_STATE_SELECTED);
      _attackButtonView.setFrame(AWE.Geometry.createRect(128, 70, 52, 52));
      _attackButtonView.onClick = function() { if (_attackButtonView.enabled()) { that.onAttackButtonClick(that); } }
      this.addChild(_attackButtonView);
      
      _retreatButtonView = AWE.UI.createButtonView();
      _retreatButtonView.initWithControllerTextAndImage(controller, 'Retreat', AWE.UI.ImageCache.getImage("map/button1"));
      _retreatButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
      _retreatButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button1highlighted"), module.CONTROL_STATE_SELECTED);
      _retreatButtonView.setFrame(AWE.Geometry.createRect(128, 70, 52, 52));
      _retreatButtonView.onClick = function() {
        if (_retreatButtonView.enabled()) {
          that.onRetreatButtonClick(_army);
        }
      }
      this.addChild(_retreatButtonView);
      
      _battleInfoButtonView = AWE.UI.createButtonView();
      _battleInfoButtonView.initWithControllerTextAndImage(controller, 'Battle Info', AWE.UI.ImageCache.getImage("map/button1"));
      _battleInfoButtonView.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
      _battleInfoButtonView.setFrame(AWE.Geometry.createRect(128, -70, 52, 52));
      _battleInfoButtonView.onClick = function() {
        if (_battleInfoButtonView.enabled()) {
          that.onBattleInfoButtonClick(_army);
        }
      }
      this.addChild(_battleInfoButtonView);
      
      _rankImageView = AWE.UI.createImageView();
      _rankImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/army/rank1"));
      _rankImageView.setFrame(AWE.Geometry.createRect(86, 0, 20, 20));
      this.addChild(_rankImageView);
      
      infoContainer = AWE.UI.createMultiLineContainer();
      infoContainer.initWithController(controller, AWE.Geometry.createRect(130,0,120,0));
      this.addChild(infoContainer);
      
      _infoText1View = AWE.UI.createLabelView();
      _infoText1View.initWithControllerAndLabel(controller);
      _infoText1View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
      _infoText1View.setTextAlign("left");
      _infoText1View.setIconImage("map/icon/owner");
      infoContainer.addChild(_infoText1View);

      _infoText2View = AWE.UI.createLabelView();
      _infoText2View.initWithControllerAndLabel(controller);
      _infoText2View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
      _infoText2View.setTextAlign("left");
      _infoText2View.setIconImage("map/icon/army/strength");
      infoContainer.addChild(_infoText2View);

      _infoText3View = AWE.UI.createLabelView();
      _infoText3View.initWithControllerAndLabel(controller);
      _infoText3View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
      _infoText3View.setTextAlign("left");
      _infoText3View.setIconImage("map/icon/army/size");
       infoContainer.addChild(_infoText3View);
            
      if (!frame) {
        my.frame.size.width = 192;
        my.frame.size.height = 128;
      }
      
      this.updateButtonVisibility();
      this.updateButtonState();
    };
    
    that.onAttackButtonClick = function() {};
    
    that.onRetreatButtonClick = function() {
      log('onRetreatButtonClick');
    };
    
    that.onBattleButtonClick = function() {};
    
    that.onMoveButtonClick = function() {
      log('onMoveButtonClick');
    };
    that.onBattleInfoButtonClick = function() {};
    that.onCancelMoveButtonClick = function() {};
    
    that.onWaylayButtonClick = function() {};
    
    that.army = function() { return _army; }
    
    that.updateView = function () {
      this.recalcView();
      _super.updateView();
    }
    
    that.updateButtonVisibility = function() {
      if (!_armyView.selected()) {
        _moveButtonView.setVisible(false);
        _attackButtonView.setVisible(false);
        _cancelButtonView.setVisible(false);        
        _retreatButtonView.setVisible(false);        
        _battleInfoButtonView.setVisible(false);        
      }
      else if (_army.isOwn() && (_army.get('mode') === null || _army.get('mode') === AWE.Config.ARMY_MODE_IDLE)) { // 0 -> idle or null -> unkown
        _moveButtonView.setVisible(true);
        _attackButtonView.setVisible(true);
        _cancelButtonView.setVisible(false);
        _retreatButtonView.setVisible(false);        
        _battleInfoButtonView.setVisible(false);        
      }
      else if (_army.isOwn() && _army.get('mode') === AWE.Config.ARMY_MODE_MOVING) {
        _moveButtonView.setVisible(false);
        _attackButtonView.setVisible(false);
        _cancelButtonView.setVisible(true);  
        _retreatButtonView.setVisible(false);        
        _battleInfoButtonView.setVisible(false);        
      }
      else if (_army.isOwn() && _army.get('isFighting')) {
        _moveButtonView.setVisible(false);
        _attackButtonView.setVisible(false);
        _cancelButtonView.setVisible(false);        
        _retreatButtonView.setVisible(true);        
        _battleInfoButtonView.setVisible(true);        
      }
      else if (_army.get('isFighting')) {
        _moveButtonView.setVisible(false);
        _attackButtonView.setVisible(false);
        _cancelButtonView.setVisible(false);        
        _retreatButtonView.setVisible(false);        
        _battleInfoButtonView.setVisible(true);        
      }
    }
    
    that.updateButtonState = function() {
      _moveButtonView.setEnabled(_army.get('ap_present') >= 1.0 && !_army.get('isFighting'));
      _attackButtonView.setEnabled(_army.get('ap_present') >= 1.0 && !_army.get('isFighting'));
      _retreatButtonView.setEnabled(_army.get('isFighting'));    
      
      _moveButtonView.setSelected(_actionMode === 'moveTargetSelection');
      _attackButtonView.setSelected(_actionMode === 'attackTargetSelection');
      _retreatButtonView.setSelected(_army.get('battle_retreat'));        
    }
    
    that.recalcView = function() {
      
      // buttons
      _stanceButtonView.setVisible(false); // NO third button at present
      this.updateButtonVisibility();
      if (_army.isOwn() && _armyView.selected()) {
        this.updateButtonState();
      }
      
      // rank image
      _rankImageView.setImage(AWE.UI.ImageCache.getImage("map/army/rank" + Math.max(1, (_army.get('rank') || 0) + 1)));

      // info view
      if (_backgroundShapeView) {
        this.removeChild(_backgroundShapeView);
      }

      _infoText1View.setText(_army.get('owner_name') + (_army.get('alliance_tag') ? (' | ' + _army.get('alliance_tag')) : ''));
      _infoText2View.setText(_army.get('strength'));
      _infoText3View.setText(_army.get('size_present'));
      
      infoContainer.layoutSubviews(); // call this by hand, as only changed visibility
      
      var backgroundGraphics = new Graphics();
      backgroundGraphics.beginFill('rgba(0, 0, 0 ,0.5)');
      backgroundGraphics.drawRoundRect(0, 0,
                                       infoContainer.frame().size.width + 12,
                                       infoContainer.frame().size.height+ 4, 4);
      _backgroundShapeView = AWE.UI.createShapeView();
      _backgroundShapeView.initWithControllerAndGraphics(my.controller, backgroundGraphics);
      _backgroundShapeView.setFrame(AWE.Geometry.createRect(infoContainer.frame().origin.x - 6, 
                                                            infoContainer.frame().origin.y - 2, 
                                                            infoContainer.frame().size.width + 12, 
                                                            infoContainer.frame().size.height+ 4));
      this.addChildAt(_backgroundShapeView, 0);      
      
      that.setNeedsDisplay();
    }
                
    that.layoutSubviews = function() {
      that.recalcView();
      _super.layoutSubviews();
    }
    
    that.army = function() {
      return _army;
    };
    
    that.setActionMode = function(actionMode) {
      _actionMode = actionMode;
    }
    
    that.annotatedView = function() {
      return _armyView;
    }
    
    that.baseView = function() {
      return _armyView;
    }
        
    return that;
  };
      
  return module;
    
}(AWE.UI || {}));



