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
    var _battleInfoButtonView = null;    
    var _foundButtonView = null;
    var _cancelButtonView = null;
    var _changeArmyButtonView = null;    
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

      _moveButtonView = AWE.UI.createButtonIconView();
      _moveButtonView.initWithControllerImageAndIcon(controller,
        AWE.UI.ImageCache.getImage("hud/annotation/button/background/green"), 
        AWE.UI.ImageCache.getImage("hud/annotation/button/move/normal"),
        AWE.Geometry.createRect(-10, 82, 64, 64)//(20, -25, 64, 64)
      );
      _moveButtonView.onClick = function() { if (_moveButtonView.enabled()) { that.onMoveButtonClick(that); } }
      this.addChild(_moveButtonView);


      _cancelButtonView = AWE.UI.createButtonIconView();
      _cancelButtonView.initWithControllerImageAndIcon(controller,
        AWE.UI.ImageCache.getImage("hud/annotation/button/background/red"), 
        AWE.UI.ImageCache.getImage("hud/annotation/button/cancel/normal"),
        AWE.Geometry.createRect(-10, 82, 64, 64)
      );
      _cancelButtonView.onClick = function() { if (_cancelButtonView.enabled()) { that.onCancelMoveButtonClick(that); } }
      this.addChild(_cancelButtonView);


      _attackButtonView = AWE.UI.createButtonIconView();
        _attackButtonView.initWithControllerImageAndIcon(controller,
          AWE.UI.ImageCache.getImage("hud/annotation/button/background/red"), 
          AWE.UI.ImageCache.getImage("hud/annotation/button/attack/normal"),
          AWE.Geometry.createRect(30, 140, 64, 64)//(-17, 22, 64, 64)
        );
      _attackButtonView.onClick = function() { if (_attackButtonView.enabled()) { that.onAttackButtonClick(that); } }
      this.addChild(_attackButtonView);


      _stanceButtonView = AWE.UI.createButtonIconView();
      _stanceButtonView.initWithControllerImageAndIcon(controller,
        AWE.UI.ImageCache.getImage("hud/annotation/button/background/blue"), 
        AWE.UI.ImageCache.getImage("hud/annotation/button/defense/normal"),
        AWE.Geometry.createRect(100, 140, 64, 64)//(-10, 82, 64, 64)
      );
      _stanceButtonView.onClick = function() { if (_stanceButtonView.enabled()) { that.onStanceButtonClick(_army); } }
      this.addChild(_stanceButtonView);  


      _changeArmyButtonView = AWE.UI.createButtonIconView();
        _changeArmyButtonView.initWithControllerImageAndIcon(controller,
          AWE.UI.ImageCache.getImage("hud/annotation/button/background/yellow"), 
          AWE.UI.ImageCache.getImage("hud/icon/army"),
          AWE.Geometry.createRect(140, 82, 64, 64)//(31, 124, 64, 64)
        );
      _changeArmyButtonView.onClick = function() { if (_changeArmyButtonView.enabled()) { that.onChangeArmyButtonClick(that); } }
      this.addChild(_changeArmyButtonView);


      _foundButtonView = AWE.UI.createButtonIconView();
      _foundButtonView.initWithControllerImageAndIcon(controller,
        AWE.UI.ImageCache.getImage("hud/annotation/button/background/purple"), 
        AWE.UI.ImageCache.getImage("hud/annotation/button/settle/normal"),
        AWE.Geometry.createRect(-10, 12, 64, 64)//(25, 118, 64, 64)
      );
      _foundButtonView.onClick = function() { that.onFoundButtonClick(that); }
      _foundButtonView.onDisabledClick = function()
        { 
          var dialog = AWE.UI.Ember.InfoDialog.create({
            contentTemplateName: 'found-settlement-error',
            heading: AWE.I18n.lookupTranslation('settlement.found.errorHeader'),
            okPressed: function() { this.destroy(); },
          });
          WACKADOO.presentModalDialog(dialog);
        }
      this.addChild(_foundButtonView);    
      
//      _retreatButtonView = AWE.UI.createButtonView();
//      _retreatButtonView.initWithControllerTextAndImage(controller, AWE.I18n.lookupTranslation('map.button.retreat'), AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
//      _retreatButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
//      _retreatButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/pressed"), module.CONTROL_STATE_SELECTED);
//      _retreatButtonView.setFrame(AWE.Geometry.createRect(128, 70, 48, 48));
//      _retreatButtonView.onClick = function() {
//        if (_retreatButtonView.enabled()) {
//          that.onRetreatButtonClick(_army);
//        }
//      }
//      this.addChild(_retreatButtonView);

      _battleInfoButtonView = AWE.UI.createButtonIconView();
      _battleInfoButtonView.initWithControllerImageAndIcon(controller,
        AWE.UI.ImageCache.getImage("hud/annotation/button/background/blue"), 
        AWE.UI.ImageCache.getImage("hud/icon/info"),
        AWE.Geometry.createRect(-10, 12, 64, 64)//(152, 86, 64, 64)
      );
      _battleInfoButtonView.onClick = function() {
        if (_battleInfoButtonView.enabled()) {
          that.onBattleInfoButtonClick(_army);
        }
      }
      this.addChild(_battleInfoButtonView);
      
      _rankImageView = AWE.UI.createImageView();
      _rankImageView.initWithControllerAndImage(controller, AWE.UI.ImageCache.getImage("map/army/rank1"));
      _rankImageView.setFrame(AWE.Geometry.createRect(86, -20, 20, 20));
      this.addChild(_rankImageView);
      
      infoContainer = AWE.UI.createMultiLineContainer();
      infoContainer.initWithController(controller, AWE.Geometry.createRect(145,-6,120,0));
      this.addChild(infoContainer);
      
      _infoText1View = AWE.UI.createLabelView();
      _infoText1View.initWithControllerAndLabel(controller);
      _infoText1View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
      _infoText1View.setTextAlign("left");
      //_infoText1View.setIconImage("map/icon/owner");
      infoContainer.addChild(_infoText1View);

      _infoText2View = AWE.UI.createLabelView();
      _infoText2View.initWithControllerAndLabel(controller);
      _infoText2View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
      _infoText2View.setTextAlign("left");
      _infoText2View.setIconImage("map/icon/fist");
      infoContainer.addChild(_infoText2View);

      _infoText3View = AWE.UI.createLabelView();
      _infoText3View.initWithControllerAndLabel(controller);
      _infoText3View.setFrame(AWE.Geometry.createRect(0, 0, 66, 24));      
      _infoText3View.setTextAlign("left");
      _infoText3View.setIconImage("map/icon/owner");
       infoContainer.addChild(_infoText3View);
            
      if (!frame) {
        my.frame.size.width = 192;
        my.frame.size.height = 128;
      }

      this.recalcView();
    };
    
    that.onAttackButtonClick = function() {};
    
    that.onChangeArmyButtonClick = function() {};

    that.onRetreatButtonClick = function() {
      log('onRetreatButtonClick');
    };

    that.onBattleButtonClick = function() {};
    that.onStanceButtonClick = function() {};

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
        _changeArmyButtonView.setVisible(false);
        _cancelButtonView.setVisible(false);        
//        _retreatButtonView.setVisible(false);
        _battleInfoButtonView.setVisible(false);
        _foundButtonView.setVisible(false);
        _stanceButtonView.setVisible(false);
      }
      else if (_army.isOwn() && _army.get('hasHomebaseFounder') && _army.get('mode') === AWE.Config.ARMY_MODE_IDLE) { // 0 -> idle or null -> unkown
        _moveButtonView.setVisible(true);
        _attackButtonView.setVisible(true);
        _changeArmyButtonView.setVisible(true);
        _cancelButtonView.setVisible(false);
//        _retreatButtonView.setVisible(false);
        _battleInfoButtonView.setVisible(false);
        _foundButtonView.setVisible(true);
        _stanceButtonView.setVisible(true);
      }
      else if (_army.isOwn() && (_army.get('mode') === null || _army.get('mode') === AWE.Config.ARMY_MODE_IDLE) && _army.getPath('homeSettlement.location_id') == _army.get('location_id')) { // 0 -> idle or null -> unkown
        _moveButtonView.setVisible(true);
        _attackButtonView.setVisible(true);
        _changeArmyButtonView.setVisible(true);
        _cancelButtonView.setVisible(false);
//        _retreatButtonView.setVisible(false);
        _battleInfoButtonView.setVisible(false);
        _foundButtonView.setVisible(_army.get('hasSettlementFounder'));
        _stanceButtonView.setVisible(true);
      }
      else if (_army.isOwn() && (_army.get('mode') === null || _army.get('mode') === AWE.Config.ARMY_MODE_IDLE)) { // 0 -> idle or null -> unkown
        _moveButtonView.setVisible(true);
        _attackButtonView.setVisible(true);
        _changeArmyButtonView.setVisible(false);
        _cancelButtonView.setVisible(false);
//        _retreatButtonView.setVisible(false);
        _battleInfoButtonView.setVisible(false);
        _foundButtonView.setVisible(_army.get('hasSettlementFounder'));
        _stanceButtonView.setVisible(true);
      }
      else if (_army.isOwn() && _army.get('mode') === AWE.Config.ARMY_MODE_MOVING) {
        _moveButtonView.setVisible(false);
        _attackButtonView.setVisible(true);
        _changeArmyButtonView.setVisible(false);
        _cancelButtonView.setVisible(true);
//        _retreatButtonView.setVisible(false);
        _battleInfoButtonView.setVisible(false);
        _foundButtonView.setVisible(false);
        _stanceButtonView.setVisible(true);
      }
      else if (_army.isOwn() && _army.get('isFighting')) {
        _moveButtonView.setVisible(true);
        _attackButtonView.setVisible(true);
        _changeArmyButtonView.setVisible(false);
        _cancelButtonView.setVisible(false);    
//        _retreatButtonView.setVisible(false);
        _battleInfoButtonView.setVisible(true);
        _foundButtonView.setVisible(false);
        _stanceButtonView.setVisible(true);
      }
      else if (_army.get('isFighting')) {
        _moveButtonView.setVisible(false);
        _attackButtonView.setVisible(false);
        _changeArmyButtonView.setVisible(false);
        _cancelButtonView.setVisible(false);
//        _retreatButtonView.setVisible(false);
        _battleInfoButtonView.setVisible(true);
        _foundButtonView.setVisible(false);
        _stanceButtonView.setVisible(false);
      }
      else {
        _moveButtonView.setVisible(false);
        _attackButtonView.setVisible(false);
        _changeArmyButtonView.setVisible(false);
        _cancelButtonView.setVisible(false);
//        _retreatButtonView.setVisible(false);
        _battleInfoButtonView.setVisible(false);
        _foundButtonView.setVisible(false);
        _stanceButtonView.setVisible(false);
      }
    }
    
    that.updateButtonState = function() {
      _moveButtonView.setEnabled(_army.get('ap_present') >= 1.0 && !_army.get('isFighting'));
      _attackButtonView.setEnabled(_army.get('ap_present') >= 1.0 && !_army.get('isFighting') && !_army.get('isMoving'));
      //_changeArmyButtonView.setEnabled(_army.get('ap_present') >= 1.0 && !_army.get('isFighting') && !_army.get('isMoving'));
      _foundButtonView.setEnabled(
        _army.canFoundSettlementAtPresentLocationNow() || _army.canFoundHomebaseAtPresentLocationNow()
      );
      _stanceButtonView.setEnabled(!_army.get('isFighting'));
//      _retreatButtonView.setEnabled(_army.get('isFighting'));
      
      _moveButtonView.setSelected(_actionMode === 'moveTargetSelection');
      _attackButtonView.setSelected(_actionMode === 'attackTargetSelection');
      //_changeArmyButtonView.setSelected(_actionMode === 'attackTargetSelection');
      _foundButtonView.setSelected(_actionMode === 'foundSettlement');
      _stanceButtonView.setSelected(_army.get('stance') == 1);

//      _retreatButtonView.setSelected(_army.get('battle_retreat'));
    }
    
    that.recalcView = function() {
      
      // buttons
      this.updateButtonVisibility();
      if (_army.isOwn() && _armyView.selected()) {
        this.updateButtonState();
      }
      
      // rank image
      _rankImageView.setImage(AWE.UI.ImageCache.getImage("map/army/rank" + Math.min(4, Math.floor((_army.get('rank') || 0) / 5 + 1))));

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



