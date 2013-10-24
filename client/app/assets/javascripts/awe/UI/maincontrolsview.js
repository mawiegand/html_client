/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createMainControlsView = function(spec, my) {

    var that;
    
    var _decorationView;    
    var _flagView;
    var _flagFrameView;
    var _frameView;
    var _heroHeadImageView;
    var _heroNameView;
    var _villageImageView;
    var _settlementImageView;
    var _messagesButton;
    var _messagesCallout;
    var _rankingButton;
    var _questsButton;
    var _questsCallout = null;
    var _shopButton;
    var _resourcesShape;
    
    var _settlementImageName = null;
    
    var _presentGender = null;
    var _presentAvatarString = null;
    
    var _resource4LabelView;

    var _resource4ProductionView;

    var _arrowTest = null;

    my = my || {};
    
    my.typeName = "MainControlsView";
    my.amounts = [0.0, 0.0, 0.0, 0.0];
    
    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
      updateIfNeeded: AWE.Ext.superior(that, "updateIfNeeded"),
    };
    
    /** overwritten view methods */
    
    that.initWithController = function(controller, frame) {
      _super.initWithController(controller, frame);
      
      this.recalcView();

      my.container.x = my.frame.origin.x;
      my.container.y = my.frame.origin.y;
      my.container.width  = my.frame.size.height;
      my.container.height = my.frame.size.height;
    }
    
    that.getSettlementButtonView = function() {
      return _villageImageView;
    }
    
    that.recalcView = function() {

      var character = AWE.GS.game.get('currentCharacter');
      var allianceId = character.get('alliance_id');
      var allianceColor = character.get('alliance_color');

      // Ressourcen Leiste
      if (!_resourcesShape) {   
        _resourcesShape = AWE.UI.createImageView();
        _resourcesShape.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/main/background"));
        _resourcesShape.setFrame(AWE.Geometry.createRect(14, 76, 119, 54));
        this.addChild(_resourcesShape, 0);
      }
      if (!_shopButton && AWE.Config.SHOP_ENABLED) {
        _shopButton = AWE.UI.createButtonView();
        _shopButton.initWithControllerTextAndImage(my.controller, AWE.I18n.lookupTranslation('map.button.shop'), AWE.UI.ImageCache.getImage("hud/main/shop/normal"));
        _shopButton.setImageForState(AWE.UI.ImageCache.getImage("hud/main/shop/hovered"), module.CONTROL_STATE_HOVERED);
        _shopButton.setFrame(AWE.Geometry.createRect(8, 61, 123, 26));
        _shopButton.setColor('rgb(30,30,30)');
        _shopButton.setShadowEnabled(false);
        _shopButton.setFont("bold 13px Arial");
        _shopButton.onClick = function() {
          my.controller.ingameShopButtonClicked();
        };
        _resourcesShape.onClick = function () {
          _shopButton.onClick();
        }
        this.addChildAt(_shopButton, 1);
      }

      // Teeth
      if (!_decorationView) {
        _decorationView = AWE.UI.createImageView();
        _decorationView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/main/decoration"));
        _decorationView.setFrame(AWE.Geometry.createRect(183, 184, 94, 37));
        this.addChild(_decorationView, 2);
      }
      
      // Main Body of Element
      if (!_frameView) {
        _frameView = AWE.UI.createImageView();
        _frameView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/main/body"));
        _frameView.setFrame(AWE.Geometry.createRect(85, 10, 259, 212));
        this.addChild(_frameView, 3);
      }
  
      // Flag
      if (!_flagView && character && allianceId) {
        _flagFrameView = AWE.UI.createImageView();
        _flagFrameView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/main/banner/large"));
        _flagFrameView.setFrame(AWE.Geometry.createRect(192, 167, 76, 77));
        _flagFrameView.onClick = function() { 
          WACKADOO.activateAllianceController(allianceId);   
        }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_flagFrameView, 4);

        _flagView = AWE.UI.createAllianceFlagView();
        _flagView.initWithController(my.controller);
        _flagView.setFrame(AWE.Geometry.createRect(202, 177, 56, 57));
        _flagView.setAllianceId(allianceId);
        _flagView.setAllianceColor(allianceColor);
        _flagView.setTagVisible(true);
        _flagView.onClick = function() { 
          WACKADOO.activateAllianceController(allianceId);   
        }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_flagView, 5);
      }
      if (_flagView && character && (allianceId === undefined || allianceId === null || allianceId === 0)) {
        this.removeChild(_flagView);
        this.removeChild(_flagFrameView);
        _flagFrameView = null;
        _flagView = null;
      }

      

      // Messages
      if (!_messagesButton) {
        _messagesButton = AWE.UI.createButtonView();
        _messagesButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/main/messages/normal"));
        _messagesButton.setImageForState(AWE.UI.ImageCache.getImage("hud/main/messages/hovered"), module.CONTROL_STATE_HOVERED);
        _messagesButton.setFrame(AWE.Geometry.createRect(243, 9, 69, 69));
        _messagesButton.onClick = function() { WACKADOO.messagesButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_messagesButton);
      }
      if (AWE.GS.CharacterManager.getCurrentCharacter()) {
        var unread = AWE.GS.CharacterManager.getCurrentCharacter().getPath('inbox.unread_messages_count');
        if (unread !== undefined && unread > 0) {
          if (!_messagesCallout) {
            _messagesCallout = AWE.UI.createButtonView();
            _messagesCallout.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/callout"));
            _messagesCallout.setFrame(AWE.Geometry.createRect(290, 10, 38, 38));
            _messagesCallout.setColor('rgb(255,255,255)');
            _messagesCallout.setShadowEnabled(false);
            _messagesCallout.setFont("bold 14px Arial");
            _messagesCallout.setTextPos(18, 16);
            _messagesCallout.onClick = function() { WACKADOO.messagesButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
            this.addChild(_messagesCallout);
          }
          if (''+unread !== _messagesCallout.text()) {
            _messagesCallout.setText(''+unread);
          }
        }
        else if (_messagesCallout) {
          this.removeChild(_messagesCallout);
          _messagesCallout = null;
        }
      }      
  
      if (!_rankingButton) {
        _rankingButton = AWE.UI.createButtonView();
        _rankingButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/main/ranking/normal"));
        _rankingButton.setImageForState(AWE.UI.ImageCache.getImage("hud/main/ranking/hovered"), module.CONTROL_STATE_HOVERED);
        _rankingButton.setFrame(AWE.Geometry.createRect(284, 66, 60, 68));
        _rankingButton.onClick = function() {
          my.controller.rankingButtonClicked();
        };
        this.addChild(_rankingButton);
      }
      
      if (!_questsButton) {
        _questsButton = AWE.UI.createButtonView();
        _questsButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/main/quests/normal"));
        _questsButton.setImageForState(AWE.UI.ImageCache.getImage("hud/main/quests/hovered"), module.CONTROL_STATE_HOVERED);
        _questsButton.setFrame(AWE.Geometry.createRect(259, 130, 66, 68));
        _questsButton.onClick = function() {
          my.controller.questsButtonClicked();
        };
        this.addChild(_questsButton);
      }         
      if (AWE.GS.TutorialStateManager.getTutorialState()) {
        var allQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('notClosedQuestStateCount');
        if (allQuestStates !== undefined && allQuestStates > 0) {
          if (!_questsCallout) {
            _questsCallout = AWE.UI.createButtonView();
            _questsCallout.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/callout"));
            _questsCallout.setFrame(AWE.Geometry.createRect(304, 132, 38, 38));
            _questsCallout.setColor('rgb(255,255,255)');
            _questsCallout.setShadowEnabled(false);
            _questsCallout.setFont("bold 14px Arial");
            _questsCallout.setTextPos(18, 16);
            _questsCallout.onClick = function() { 
              my.controller.questsButtonClicked();  
            };
            this.addChild(_questsCallout);
          }
          if (''+allQuestStates !== _questsCallout.text()) {
            _questsCallout.setText(''+allQuestStates);
          }
        }
        else if (_questsCallout) {
          this.removeChild(_questsCallout);
          _questsCallout = null;
        }
      }      
      
      if (!_resource4LabelView) {
        _resource4LabelView = AWE.UI.createLabelView();
        _resource4LabelView.initWithControllerAndLabel(my.controller);
        _resource4LabelView.setTextAlign("left");
        _resource4LabelView.setIconImage("resource/icon/cash");
        _resource4LabelView.setFont("14px Arial");
        _resource4LabelView.setFrame(AWE.Geometry.createRect(30, 88, 80, 24));      
        _resource4LabelView.onClick = function() {
          my.controller.ingameShopButtonClicked();
        };
        this.addChild(_resource4LabelView);
      }
      if (!_resource4ProductionView) {
        _resource4ProductionView = AWE.UI.createLabelView();
        _resource4ProductionView.initWithControllerAndLabel(my.controller);
        _resource4ProductionView.setTextAlign("left");
        _resource4ProductionView.setFont("12px Arial");
        _resource4ProductionView.setFrame(AWE.Geometry.createRect(54, 102, 60, 24));      
        _resource4ProductionView.onClick = function() {
          my.controller.ingameShopButtonClicked();
        };
        this.addChild(_resource4ProductionView);
      }         
      
      if (!_villageImageView) { 
        _settlementImageName = "map/colony/small";
  
        _villageImageView = AWE.UI.createInspectorBubbleView();
        _villageImageView.initWithControllerAndImage(my.controller, 
                                                     AWE.UI.ImageCache.getImage("hud/main/inset"),
                                                     AWE.UI.ImageCache.getImage("hud/main/glass/normal"));
        _villageImageView.setImageForState(AWE.UI.ImageCache.getImage("hud/main/glass/hovered"), module.CONTROL_STATE_HOVERED);
        _villageImageView.setFrame(AWE.Geometry.createRect(154, 40, 148, 148));

        _villageImageView.onClick = function() { 
          var baseControllerActive = WACKADOO.baseControllerActive();
          WACKADOO.baseButtonClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
          if (baseControllerActive) {
            AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_settlement_button1');
          } 
        };
        _villageImageView.onDoubleClick = function(evt) {
          var baseControllerActive = WACKADOO.baseControllerActive();
			    WACKADOO.baseButtonDoubleClicked();
          if (!baseControllerActive) {
            AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_settlement_button2');
          }
        };
        
        _settlementImageName = "map/colony/small";
          
        _settlementImageView = AWE.UI.createImageView();
        _settlementImageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage(_settlementImageName));
        _settlementImageView.setFrame(AWE.Geometry.createRect(32, 38, 64, 64));
          
        _villageImageView.setObjectView(_settlementImageView);
        this.addChild(_villageImageView);
      }
      
      if (AWE.GS.game.get('currentCharacter')) {
        var settlement = AWE.GS.SettlementManager.getHomeBaseOfCharacter(AWE.GS.game.get('currentCharacter'));
        if (!settlement) {
          var self = this;
          AWE.GS.SettlementManager.updateHomeBaseOfCharacter(AWE.GS.game.get('currentCharacter'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
            self.setNeedsUpdate();
          });
        }
        else {
          var level = AWE.Util.Rules.normalizedLevel(settlement.get('level'), settlement.get('type_id'));
          var divineSupporterImage = AWE.GS.game.getPath('currentCharacter.divine_supporter');

          var newSettlementImageName = divineSupporterImage ? 'map/colony/1/small' : 'map/colony/small';
          if (level > 3) {
            newSettlementImageName   = divineSupporterImage ? 'map/colony/1/middle' : 'map/colony/middle';
          }
          if (level > 7) {
            newSettlementImageName   = divineSupporterImage ? 'map/colony/1/big' : 'map/colony/big';
          }
      
          if (newSettlementImageName != _settlementImageName && _settlementImageView) {
            _settlementImageName = newSettlementImageName;
            _settlementImageView.setImage(AWE.UI.ImageCache.getImage(_settlementImageName));
          }
        }
      }   
      
      
      if (!_heroHeadImageView) {
        _heroNameView = AWE.UI.createButtonView();
        _heroNameView.initWithControllerTextAndImage(my.controller, "", AWE.UI.ImageCache.getImage("hud/main/name/normal"));
        _heroNameView.setImageForState(AWE.UI.ImageCache.getImage("hud/main/name/hovered"), module.CONTROL_STATE_HOVERED);
        _heroNameView.setFrame(AWE.Geometry.createRect(75, 174, 123, 30));
        _heroNameView.setFont("12px Arial");
        _heroNameView.setColor('rgb(0,0,0)');
        _heroNameView.setShadowEnabled(false);
        _heroNameView.setTextPos(null, 13);
        _heroNameView.onClick = function() { WACKADOO.characterButtonClicked(); };
        this.addChild(_heroNameView);
      }

      if (!_heroHeadImageView || AWE.GS.game.getPath('currentCharacter.avatar_string') != _presentAvatarString) {

        if (_heroHeadImageView) {
          this.removeChild(_heroHeadImageView);
        }
        _heroHeadImageView = AWE.UI.createAvatarView();
        _heroHeadImageView.initWithControllerAndAvatar(my.controller, AWE.GS.game.getPath('currentCharacter.avatar')); // TODO: get and pass avatar
        _heroHeadImageView.setFrame(AWE.Geometry.createRect(85, 92, 96, 96));
        _heroHeadImageView.onClick = function() { WACKADOO.characterButtonClicked(); };
        this.addChild(_heroHeadImageView);

        _presentAvatarString = AWE.GS.game.getPath('currentCharacter.avatar_string');
        _heroHeadImageView.setNeedsUpdate();
        _heroHeadImageView.setNeedsDisplay();
        _heroHeadImageView.setNeedsLayout();
      }

      if (character.get('female') && _presentGender === "male") {
        // TODO: update on change of avatar, not only gender.
        _presentGender = "female";
      }
      else if (!character.get('female') && _presentGender === "female") {
        // TODO: update on change of avatar, not only gender.
    
        _presentGender = "male";
      }
      

      var name = character.get('name');
      if (_heroNameView.text() != name) {
        _heroNameView.setText(name);
      }   
      
    };
    
    that.updateView = function() {
      this.recalcView();
      
      var pool = AWE.GS.ResourcePoolManager.getResourcePool();
      if (pool) {
        my.amounts[3] = pool.presentAmount('resource_cash');
        
        _resource4LabelView.setText(""+my.amounts[3]);
        var productionRate = pool.get('resource_cash_production_rate');
        if (productionRate >= 0) {
          _resource4ProductionView.setText("+"+(Math.floor(productionRate*100.0)/100.0)+"/h");
        }
        else {
          _resource4ProductionView.setText("+"+(Math.ceil(productionRate*100.0)/100.0)+"/h");
        }
      }
      
      _super.updateView();
    }
    
    /** checks for itself whether the view needs an update (changed reosources) or not. */
    that.updateIfNeeded = function() {
      var changed = false;
      var pool = AWE.GS.ResourcePoolManager.getResourcePool();
      if (pool) {
        changed = changed || pool.presentAmount('resource_cash')  !== my.amounts[3];
      }
      
      if (!changed && AWE.GS.CharacterManager.getCurrentCharacter()) {
        var unread = AWE.GS.CharacterManager.getCurrentCharacter().getPath('inbox.unread_messages_count');
        if (unread !== undefined && unread > 0) {
          changed = changed || !_messagesCallout || (''+unread !== _messagesCallout.text());
        }
        else {
          changed = changed || _messagesCallout;
        }
      }  
      
      if (!changed && AWE.GS.TutorialStateManager.getTutorialState()) {
        var allQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('notClosedQuestStateCount');
        if (allQuestStates !== undefined && allQuestStates !== null) {
          changed = changed || !_questsCallout || (''+allQuestStates !== _questsCallout.text());
        }
        else {
          changed = changed || _questsCallout;
        }
      }    
      
      if (changed) {
        log(">> NEED TO UPDATE HUD DUE TO CHANGED RESOURCE AMOUNT");
        this.setNeedsUpdate();
      }
      _super.updateIfNeeded();
    }
    
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));


