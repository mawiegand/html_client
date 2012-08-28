/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createMainControlsView = function(spec, my) {

    var that;
    
    var _flagView;
    var _flagFrameView;
    var _frameView;
    var _heroHeadImageView;
    var _fortressButton;
    var _villageImageView;
    var _messagesButton;
    var _moreButton;
    var _locationsButton;
    var _armiesButton;
    var _shopButton;
    var _resourcesShape;
    
    var _presentGender = null;
    
    var _resource1LabelView;
    var _resource2LabelView;
    var _resource3LabelView;
    var _resource4LabelView;

    var _resource1ProductionView;
    var _resource2ProductionView;
    var _resource3ProductionView;
    var _resource4ProductionView;


    var _resource5LabelView;
    var _resource6LabelView;
        
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
    
    that.recalcView = function() {

      var character = AWE.GS.CharacterManager.getCurrentCharacter();
      var allianceId = character.get('alliance_id');
            
      // Ressourcen Leiste
      // Flagge
      if (!_resourcesShape) {   
        var _resourcesShapeGraphics = new Graphics();
        _resourcesShapeGraphics.setStrokeStyle(0);
        _resourcesShapeGraphics.beginFill('rgba(0, 0, 0, 0.5)');
        _resourcesShapeGraphics.drawRoundRect(0, 20, 300, 80, 5);
        _resourcesShape = AWE.UI.createShapeView();
        _resourcesShape.initWithControllerAndGraphics(my.controller, _resourcesShapeGraphics);    
        this.addChild(_resourcesShape);
      }
  
      if (!_flagView && character && allianceId) {
        _flagView = AWE.UI.createAllianceFlagView();
        _flagView.initWithController(my.controller);
        _flagView.setFrame(AWE.Geometry.createRect(242, 4, 74, 98));
        _flagView.setAllianceId(allianceId);
        _flagView.setTagVisible(true);
        _flagView.onClick = function() { 
          WACKADOO.activateAllianceController(allianceId);   
        }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_flagView);

        _flagFrameView = AWE.UI.createImageView();
        _flagFrameView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/banner/large"));
        _flagFrameView.setFrame(AWE.Geometry.createRect(239, 0, 82, 104));
        _flagView.onClick = function() { 
          WACKADOO.activateAllianceController(allianceId);   
        }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_flagFrameView);
      }
      if (_flagView && character && (allianceId === undefined || allianceId === null || allianceId === 0)) {
        this.removeChild(_flagView);
        this.removeChild(_flagFrameView);
        _flagFrameView = null;
        _flagView = null;
      }

      if (!_frameView) {
        _frameView = AWE.UI.createImageView();
        _frameView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/main/frame"));
        _frameView.setFrame(AWE.Geometry.createRect(188, 24, 220, 190));
        this.addChild(_frameView);
      }
      
      if (!_heroHeadImageView) {
        _heroHeadImageView = AWE.UI.createButtonView();
        _heroHeadImageView.initWithControllerTextAndImage(my.controller, "", AWE.UI.ImageCache.getImage("hud/head/male/normal"));
        _heroHeadImageView.setImageForState(AWE.UI.ImageCache.getImage("hud/head/male/hovered"), module.CONTROL_STATE_HOVERED);
        _presentGender = "male";
        _heroHeadImageView.setFrame(AWE.Geometry.createRect(188, 85, 128, 128));
        _heroHeadImageView.onClick = function() { WACKADOO.characterButtonClicked(); };
        this.addChild(_heroHeadImageView);
      }   
      if (character.get('female') && _presentGender === "male") {
        _heroHeadImageView.setImageForState(AWE.UI.ImageCache.getImage("hud/head/female/normal"), module.CONTROL_STATE_NORMAL);
        _heroHeadImageView.setImageForState(AWE.UI.ImageCache.getImage("hud/head/female/hovered"), module.CONTROL_STATE_HOVERED);        
        _presentGender = "female";
      }
      else if (!character.get('female') && _presentGender === "female") {
        _heroHeadImageView.setImageForState(AWE.UI.ImageCache.getImage("hud/head/male/normal"), module.CONTROL_STATE_NORMAL);
        _heroHeadImageView.setImageForState(AWE.UI.ImageCache.getImage("hud/head/male/hovered"), module.CONTROL_STATE_HOVERED);
        _presentGender = "male";
      }
      
      var heroNameView = _heroHeadImageView.textLabel();
      heroNameView.font = "11px Arial";
      heroNameView.color = 'rgb(0,0,0)';
      heroNameView.y = 96;
      var name = character.get('name') ? character.get('name').substring(0, Math.min(12, character.get('name').length)) : ""
      if (_heroHeadImageView.text() != name) {
        _heroHeadImageView.setText(name);
      }
  
      if (!_villageImageView) {
        _villageImageView = AWE.UI.createImageView();
        _villageImageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("map/colony/big"));
        _villageImageView.setFrame(AWE.Geometry.createRect(293, 20, 100, 100));
        _villageImageView.onClick = function() {
          var mapControllerActive = WACKADOO.mapControllerActive();
          WACKADOO.baseButtonClicked(); // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
          if (mapControllerActive) {
            AWE.GS.TutorialStateManager.checkForCustomTestRewards('quest_settlement_button');
          }
        }; 
        this.addChild(_villageImageView);
      }

      // Messages
      if (!_messagesButton) {
        _messagesButton = AWE.UI.createButtonView();
        _messagesButton.initWithControllerTextAndImage(my.controller, 'Messages', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        _messagesButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        _messagesButton.setFrame(AWE.Geometry.createRect(364, -10, 72, 72));
        _messagesButton.onClick = function() { WACKADOO.messagesButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_messagesButton);
      }
      if (AWE.GS.CharacterManager.getCurrentCharacter()) {
        var unread = AWE.GS.CharacterManager.getCurrentCharacter().getPath('inbox.unread_messages_count');
        var string = "Messages";
        if (unread !== undefined && unread > 0) {
          string = "Messages\n(" + unread + ")";
        }
        if (string !== _messagesButton.text()) {
          _messagesButton.setText(string);
        }
      }      
  
      if (!_moreButton) {
        _moreButton = AWE.UI.createButtonView();
        _moreButton.initWithControllerTextAndImage(my.controller, 'Ranking', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        _moreButton.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        _moreButton.setFrame(AWE.Geometry.createRect(390, 48, 72, 72));
        // _moreButton.onClick = function() { WACKADOO.messagesButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        _moreButton.onClick = function() {
          my.controller.rankingButtonClicked();
        };

        this.addChild(_moreButton);
      }
  
/*    if (!_locationsButton) {
        _locationsButton = AWE.UI.createButtonView();
        _locationsButton.initWithControllerTextAndImage(my.controller, 'Locations', AWE.UI.ImageCache.getImage("map/button1"));
        _locationsButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        _locationsButton.setFrame(AWE.Geometry.createRect(364, 106, 72, 72));
        // _moreButton.onClick = function() { WACKADOO.messagesButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_locationsButton);
      }*/
      
/*    if (!_armiesButton) {
        _armiesButton = AWE.UI.createButtonView();
        _armiesButton.initWithControllerTextAndImage(my.controller, 'Armies', AWE.UI.ImageCache.getImage("map/button1"));
        _armiesButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        _armiesButton.setFrame(AWE.Geometry.createRect(308, 130, 72, 72));
        _armiesButton.onClick = function() {
          my.controller.shopButtonClicked();
        };
        this.addChild(_armiesButton);
      }*/
      
      if (!_shopButton) {
        _shopButton = AWE.UI.createButtonView();
        _shopButton.initWithControllerTextAndImage(my.controller, AWE.I18n.lookupTranslation('shop.button'), AWE.UI.ImageCache.getImage("hud/shop/normal"));
        _shopButton.setImageForState(AWE.UI.ImageCache.getImage("hud/shop/hovered"), module.CONTROL_STATE_HOVERED);
        _shopButton.setFrame(AWE.Geometry.createRect(20, 95, 100, 30));
        _shopButton.onClick = function() {
          my.controller.ingameShopButtonClicked();
        };
        this.addChild(_shopButton);
      }
      
      if (!_resource1LabelView) {
        _resource1LabelView = AWE.UI.createLabelView();
        _resource1LabelView.initWithControllerAndLabel(my.controller);
        _resource1LabelView.setTextAlign("left");
        _resource1LabelView.setIconImage("resource/icon/wood");
        _resource1LabelView.setFont("14px Arial");
        _resource1LabelView.setFrame(AWE.Geometry.createRect(100, 30, 80, 24));      
        this.addChild(_resource1LabelView);
      }
      if (!_resource1ProductionView) {
        _resource1ProductionView = AWE.UI.createLabelView();
        _resource1ProductionView.initWithControllerAndLabel(my.controller);
        _resource1ProductionView.setTextAlign("left");
        _resource1ProductionView.setFont("12px Arial");
        _resource1ProductionView.setFrame(AWE.Geometry.createRect(120, 48, 60, 24));      
        this.addChild(_resource1ProductionView);
      }      
      
      if (!_resource2LabelView) {
        _resource2LabelView = AWE.UI.createLabelView();
        _resource2LabelView.initWithControllerAndLabel(my.controller);
        _resource2LabelView.setTextAlign("left");
        _resource2LabelView.setIconImage("resource/icon/stone");
        _resource2LabelView.setFont("14px Arial");
        _resource2LabelView.setFrame(AWE.Geometry.createRect(20, 30, 80, 24));      
        this.addChild(_resource2LabelView);
      }
      if (!_resource2ProductionView) {
        _resource2ProductionView = AWE.UI.createLabelView();
        _resource2ProductionView.initWithControllerAndLabel(my.controller);
        _resource2ProductionView.setTextAlign("left");
        _resource2ProductionView.setFont("12px Arial");
        _resource2ProductionView.setFrame(AWE.Geometry.createRect(40, 48, 60, 24));      
        this.addChild(_resource2ProductionView);
      }   
      
      if (!_resource3LabelView) {
        _resource3LabelView = AWE.UI.createLabelView();
        _resource3LabelView.initWithControllerAndLabel(my.controller);
        _resource3LabelView.setTextAlign("left");
        _resource3LabelView.setIconImage("resource/icon/fur");
        _resource3LabelView.setFont("14px Arial");
        _resource3LabelView.setFrame(AWE.Geometry.createRect(180, 30, 80, 24));      
        this.addChild(_resource3LabelView);
      }
      if (!_resource3ProductionView) {
        _resource3ProductionView = AWE.UI.createLabelView();
        _resource3ProductionView.initWithControllerAndLabel(my.controller);
        _resource3ProductionView.setTextAlign("left");
        _resource3ProductionView.setFont("12px Arial");
        _resource3ProductionView.setFrame(AWE.Geometry.createRect(200, 48, 60, 24));      
        this.addChild(_resource3ProductionView);
      }   
      
      if (!_resource4LabelView) {
        _resource4LabelView = AWE.UI.createLabelView();
        _resource4LabelView.initWithControllerAndLabel(my.controller);
        _resource4LabelView.setTextAlign("left");
        _resource4LabelView.setIconImage("hud/frog/face");
        _resource4LabelView.setFont("14px Arial");
        _resource4LabelView.setFrame(AWE.Geometry.createRect(20, 70, 80, 24));      
        this.addChild(_resource4LabelView);
      }
      if (!_resource4ProductionView) {
        _resource4ProductionView = AWE.UI.createLabelView();
        _resource4ProductionView.initWithControllerAndLabel(my.controller);
        _resource4ProductionView.setTextAlign("left");
        _resource4ProductionView.setFont("12px Arial");
        _resource4ProductionView.setFrame(AWE.Geometry.createRect(80, 72, 60, 24));      
        this.addChild(_resource4ProductionView);
      }         
      
      /*
      if (!_resource5LabelView) {
        _resource5LabelView = AWE.UI.createLabelView();
        _resource5LabelView.initWithControllerAndLabel(my.controller);
        _resource5LabelView.setTextAlign("left");
        _resource5LabelView.setIconImage("map/display/icon");
        _resource5LabelView.setFont("14px Arial");
        _resource5LabelView.setFrame(AWE.Geometry.createRect(100, 70, 80, 24));      
        this.addChild(_resource5LabelView);
      }
      
      if (!_resource6LabelView) {
        _resource6LabelView = AWE.UI.createLabelView();
        _resource6LabelView.initWithControllerAndLabel(my.controller);
        _resource6LabelView.setTextAlign("left");
        _resource6LabelView.setIconImage("map/display/icon");
        _resource6LabelView.setFont("14px Arial");
        _resource6LabelView.setFrame(AWE.Geometry.createRect(180, 70, 80, 24));      
        this.addChild(_resource6LabelView);
      }*/
    };
    
    that.updateView = function() {
      this.recalcView();
      
      var pool = AWE.GS.ResourcePoolManager.getResourcePool();
      if (pool) {
        my.amounts[0] = pool.presentAmount('resource_wood');
        my.amounts[1] = pool.presentAmount('resource_stone');
        my.amounts[2] = pool.presentAmount('resource_fur');
        my.amounts[3] = pool.presentAmount('resource_cash');

        _resource1LabelView.setText(""+my.amounts[0]);
        _resource1ProductionView.setText("+"+Math.floor(pool.get('resource_wood_production_rate'))+"/h");

        _resource2LabelView.setText(""+my.amounts[1]);
        _resource2ProductionView.setText("+"+Math.floor(pool.get('resource_stone_production_rate'))+"/h");

        _resource3LabelView.setText(""+my.amounts[2]);
        _resource3ProductionView.setText("+"+Math.floor(pool.get('resource_fur_production_rate'))+"/h");

        _resource4LabelView.setText(""+my.amounts[3]);
        _resource4ProductionView.setText("+"+(Math.floor(pool.get('resource_cash_production_rate')*100.0)/100.0)+"/h");

      }
      
      _super.updateView();
    }
    
    /** checks for itself whether the view needs an update (changed reosources) or not. */
    that.updateIfNeeded = function() {
      var changed = false;
      var pool = AWE.GS.ResourcePoolManager.getResourcePool();
      if (pool) {
        changed = changed || pool.presentAmount('resource_wood')  !== my.amounts[0];
        changed = changed || pool.presentAmount('resource_stone') !== my.amounts[1];
        changed = changed || pool.presentAmount('resource_fur')   !== my.amounts[2];
        changed = changed || pool.presentAmount('resource_cash')  !== my.amounts[3];
      }
      
      if (!changed && AWE.GS.CharacterManager.getCurrentCharacter()) {
        var unread = AWE.GS.CharacterManager.getCurrentCharacter().getPath('inbox.unread_messages_count');
        var string = "Messages";
        if (unread !== undefined && unread > 0) {
          string = "Messages\n(" + unread + ")";
        }
        changed = changed || string !== _messagesButton.text();
      }      
      
      if (changed) {
        console.log(">> NEED TO UPDATE HUD DUE TO CHANGED RESOURCE AMOUNT");
        this.setNeedsUpdate();
      }
      _super.updateIfNeeded();
    }
    
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));


