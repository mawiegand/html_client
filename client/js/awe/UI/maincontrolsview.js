/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createMainControlsView = function(spec, my) {

    var that;
    
    var _flagView;
    var _heroButton;
    var _heroHeadImageView;
    var _fortressButton;
    var _villageImageView;
    var _messagesButton;
    var _moreButton;
    var _locationsButton;
    var _armiesButton;
    var _shopButton;
    var _resourcesShape;
    
    var _resource1LabelView;
    var _resource2LabelView;
    var _resource3LabelView;
    var _resource4LabelView;
    var _resource5LabelView;
    var _resource6LabelView;
        
    my = my || {};
    
    my.typeName = "MainControlsView";
    
    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
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
        _flagView.setFrame(AWE.Geometry.createRect(240, 0, 80, 100));
        _flagView.setAllianceId(allianceId);
        _flagView.setTagVisible(true);
        _flagView.onClick = function() { 
          WACKADOO.activateAllianceController(allianceId);   
        }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_flagView);
      }
  
      if (!_heroButton) {
        var _heroButtonGraphics = new Graphics();
        _heroButtonGraphics.setStrokeStyle(1);
        _heroButtonGraphics.beginStroke('rgb(0, 0, 0)');
        _heroButtonGraphics.beginFill('rgb(255, 255, 255)');
        _heroButtonGraphics.drawCircle(254, 146, 64);
        _heroButton = AWE.UI.createShapeView();
        _heroButton.initWithControllerAndGraphics(my.controller, _heroButtonGraphics);    
        this.addChild(_heroButton);
      }
      
      if (!_heroHeadImageView) {
        _heroHeadImageView = AWE.UI.createImageView();
        _heroHeadImageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("hud/head"));
        _heroHeadImageView.setFrame(AWE.Geometry.createRect(198, 85, 100, 100));
        this.addChild(_heroHeadImageView);
      }
  
      if (!_fortressButton) {
        var _fortressButtonGraphics = new Graphics();
        _fortressButtonGraphics.setStrokeStyle(1);
        _fortressButtonGraphics.beginStroke('rgb(0, 0, 0)');
        _fortressButtonGraphics.beginFill('rgb(255, 255, 255)');
        _fortressButtonGraphics.drawCircle(344, 84, 64);
        _fortressButton = AWE.UI.createShapeView();
        _fortressButton.initWithControllerAndGraphics(my.controller, _fortressButtonGraphics);    
        _fortressButton.onClick = function() { WACKADOO.baseButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_fortressButton);
      }    
  
      if (!_villageImageView) {
        _villageImageView = AWE.UI.createImageView();
        _villageImageView.initWithControllerAndImage(my.controller, AWE.UI.ImageCache.getImage("map/colony/big"));
        _villageImageView.setFrame(AWE.Geometry.createRect(293, 20, 100, 100));
        _villageImageView.onClick = function() { WACKADOO.baseButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_villageImageView);
      }

      // Messages
      if (!_messagesButton) {
        _messagesButton = AWE.UI.createButtonView();
        _messagesButton.initWithControllerTextAndImage(my.controller, 'Messages', AWE.UI.ImageCache.getImage("map/button1"));
        _messagesButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        _messagesButton.setFrame(AWE.Geometry.createRect(364, -10, 72, 72));
        _messagesButton.onClick = function() { WACKADOO.messagesButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_messagesButton);
      }
  
      if (!_moreButton) {
        _moreButton = AWE.UI.createButtonView();
        _moreButton.initWithControllerTextAndImage(my.controller, 'More...', AWE.UI.ImageCache.getImage("map/button1"));
        _moreButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        _moreButton.setFrame(AWE.Geometry.createRect(390, 48, 72, 72));
        // _moreButton.onClick = function() { WACKADOO.messagesButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_moreButton);
      }
  
      if (!_locationsButton) {
        _locationsButton = AWE.UI.createButtonView();
        _locationsButton.initWithControllerTextAndImage(my.controller, 'Locations', AWE.UI.ImageCache.getImage("map/button1"));
        _locationsButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        _locationsButton.setFrame(AWE.Geometry.createRect(364, 106, 72, 72));
        // _moreButton.onClick = function() { WACKADOO.messagesButtonClicked();  }; // TODO: this is a hack. HUD must be connected by screen controller or should go to application controller.
        this.addChild(_locationsButton);
      }
      
      if (!_armiesButton) {
        _armiesButton = AWE.UI.createButtonView();
        _armiesButton.initWithControllerTextAndImage(my.controller, 'Armies', AWE.UI.ImageCache.getImage("map/button1"));
        _armiesButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
        _armiesButton.setFrame(AWE.Geometry.createRect(308, 130, 72, 72));
        _armiesButton.onClick = function() {
          my.controller.shopButtonClicked();
        };
        this.addChild(_armiesButton);
      }
      
      if (!_shopButton) {
        _shopButton = AWE.UI.createButtonView();
        _shopButton.initWithControllerTextAndImage(my.controller, 'Shop', AWE.UI.ImageCache.getImage("map/button1"));
        _shopButton.setImageForState(AWE.UI.ImageCache.getImage("map/button3"), module.CONTROL_STATE_HOVERED);
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
        _resource1LabelView.setIconImage("map/display/icon");
        _resource1LabelView.setFont("14px Arial");
        _resource1LabelView.setFrame(AWE.Geometry.createRect(20, 30, 80, 24));      
        this.addChild(_resource1LabelView);
      }
      
      if (!_resource2LabelView) {
        _resource2LabelView = AWE.UI.createLabelView();
        _resource2LabelView.initWithControllerAndLabel(my.controller);
        _resource2LabelView.setTextAlign("left");
        _resource2LabelView.setIconImage("map/display/icon");
        _resource2LabelView.setFont("14px Arial");
        _resource2LabelView.setFrame(AWE.Geometry.createRect(100, 30, 80, 24));      
        this.addChild(_resource2LabelView);
      }
      
      if (!_resource3LabelView) {
        _resource3LabelView = AWE.UI.createLabelView();
        _resource3LabelView.initWithControllerAndLabel(my.controller);
        _resource3LabelView.setTextAlign("left");
        _resource3LabelView.setIconImage("map/display/icon");
        _resource3LabelView.setFont("14px Arial");
        _resource3LabelView.setFrame(AWE.Geometry.createRect(180, 30, 80, 24));      
        this.addChild(_resource3LabelView);
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
      }
    };
    
    that.updateView = function() {
      this.recalcView();
      
      var pool = AWE.GS.ResourcePoolManager.getResourcePool();
      if (pool) {
        var diff = new Date() - Date.parseISODate(pool.get('productionUpdatedAt'));
        diff = (diff < 0) ? 0 : (diff / 3600000); // diff is in milliseconds, production_rates count per day
        
        _resource1LabelView.setText(AWE.UI.Util.round(parseInt(pool.get('resource_wood_amount')) + diff * pool.get('resource_wood_production_rate')));
        _resource2LabelView.setText(AWE.UI.Util.round(parseInt(pool.get('resource_stone_amount')) + diff * pool.get('resource_stone_production_rate')));
        _resource3LabelView.setText(AWE.UI.Util.round(parseInt(pool.get('resource_fur_amount')) + diff * pool.get('resource_fur_production_rate')));
        _resource4LabelView.setText(AWE.UI.Util.round(parseInt(pool.get('resource_cash_amount')) + diff * pool.get('resource_cash_production_rate')));
      }
      
      _super.updateView();
    }
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));


