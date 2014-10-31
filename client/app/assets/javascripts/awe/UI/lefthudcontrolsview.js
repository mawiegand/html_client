/* Author: Jona Boeddinghaus <jona@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.HUDModeMap = 0;
  module.HUDModeSettlement = 1;

  module.createLeftHUDControlsView = function(spec, my) {

    var that;
    
    var _hudMode = module.HUDModeMap;
    
    // shared buttons (Map and Settlement)
    var _menuButton;
    var _rankingButton;
    
    // Map only buttons
    var _normalTerrainButton;
    var _strategicTerrainButton;    
    var _mapModeNormal = true;
    var _gamingPieceSelectorButton;
    var _switchToSettlementButton;
    
    // Settlement only buttons
    var _recruitButton;
    var _switchToMapButton;
    /* TODO:
     * allianceButton
     * infoOwnSettlementButton
     * nextSettlementButton
     * previousSettlementButton
     */
     
    my = my || {};
    
    my.typeName = "LeftHUDControlsView";
    
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

      if (!_menuButton) {
        _menuButton = AWE.UI.createButtonView();
        _menuButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/menu/normal"));
        _menuButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/menu/hover"), module.CONTROL_STATE_HOVERED);
        _menuButton.setFrame(AWE.Geometry.createRect(10, 0, 52, 52));
        _menuButton.onClick = function() {
          my.controller.menuButtonClicked();
        };
        this.addChild(_menuButton);
      }  
  
      if (!_rankingButton) {
        _rankingButton = AWE.UI.createButtonView();
        _rankingButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/ranking/normal"));
        _rankingButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/ranking/hover"), module.CONTROL_STATE_HOVERED);
        _rankingButton.setFrame(AWE.Geometry.createRect(10, 62, 52, 52));
        _rankingButton.onClick = function() {
          my.controller.rankingButtonClicked();
        };
        this.addChild(_rankingButton);
      }
      
      if (_hudMode === module.HUDModeMap)
      {
        // show map buttons
        
        if (_mapModeNormal)
        {
          if (!_strategicTerrainButton) {
            _strategicTerrainButton = AWE.UI.createButtonView();
            _strategicTerrainButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/map_mountains/normal"));
            _strategicTerrainButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/map_mountains/hover"), module.CONTROL_STATE_HOVERED);
            _strategicTerrainButton.setFrame(AWE.Geometry.createRect(10, 144, 52, 52));
            _strategicTerrainButton.onClick = function() {
              my.controller.strategicTerrainButtonClicked();
            };
            this.addChild(_strategicTerrainButton);
          }
        }
        else
        {
          if (!_normalTerrainButton) {
            _normalTerrainButton = AWE.UI.createButtonView();
            // TODO: FIND CORRECT ASSET!
            _normalTerrainButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/compass/normal"));
            _normalTerrainButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/compass/hover"), module.CONTROL_STATE_HOVERED);
            _normalTerrainButton.setFrame(AWE.Geometry.createRect(10, 144, 52, 52));
            _normalTerrainButton.onClick = function() {
              my.controller.normalTerrainButtonClicked();
            };
            this.addChild(_normalTerrainButton);
          }
        }
        
        if (!_gamingPieceSelectorButton) {
          _gamingPieceSelectorButton = AWE.UI.createButtonView();
          _gamingPieceSelectorButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/army_menu/normal"));
          _gamingPieceSelectorButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/army_menu/hover"), module.CONTROL_STATE_HOVERED);
          _gamingPieceSelectorButton.setFrame(AWE.Geometry.createRect(10, 208, 52, 52));
          _gamingPieceSelectorButton.onClick = function() {
            my.controller.gamingPieceSelectorButtonClicked();
          };
          this.addChild(_gamingPieceSelectorButton);
        }
        
        if (!_switchToSettlementButton) {
          _switchToSettlementButton = AWE.UI.createButtonView();
          _switchToSettlementButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/settlement/normal"));
          _switchToSettlementButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/settlement/hover"), module.CONTROL_STATE_HOVERED);
          _switchToSettlementButton.setFrame(AWE.Geometry.createRect(10, 270, 100, 94));
          _switchToSettlementButton.onClick = function() {
            my.controller.switchToSettlementButtonClicked();
          };
          _switchToSettlementButton.onDoubleClick = function() {
            my.controller.switchToSettlementButtonDoubleClicked();
          };          
          this.addChild(_switchToSettlementButton);
        }
      }
      else if (_hudMode === module.HUDModeSettlement)
      {
        // show settlement buttons
        
        if (!_recruitButton) {
          _recruitButton = AWE.UI.createButtonView();
          _recruitButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/army/normal"));
          _recruitButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/army/hover"), module.CONTROL_STATE_HOVERED);
          _recruitButton.setFrame(AWE.Geometry.createRect(10, 208, 52, 52));
          _recruitButton.onClick = function() {
            my.controller.recruitButtonClicked();
          };
          this.addChild(_recruitButton);
        }
        
        if (!_switchToMapButton) {
          _switchToMapButton = AWE.UI.createButtonView();
          _switchToMapButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/map/normal"));
          _switchToMapButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/map/hover"), module.CONTROL_STATE_HOVERED);
          _switchToMapButton.setFrame(AWE.Geometry.createRect(10, 270, 100, 94));
          _switchToMapButton.onClick = function() {
            my.controller.switchToMapButtonClicked();
          };
          this.addChild(_switchToMapButton);
        }
      }
      
    };
    
    that.setHUDMode = function(mode)
    {
      if (_hudMode !== mode)
      {
        _hudMode = mode;
        
        if (_hudMode === module.HUDModeMap)
        {
          // remove settlement buttons
          if (_recruitButton)
          {
            this.removeChild(_recruitButton);
            _recruitButton = null;
          }
          if (_switchToMapButton)
          {
            this.removeChild(_switchToMapButton);
            _switchToMapButon = null;
          }
        }
        else if (_hudMode === module.HUDModeSettlement)
        {    
          // remove map buttons
          if (_normalTerrainButton)
          {
            this.removeChild(_normalTerrainButton);
            _normalTerrainButton = null;
          }
          if (_strategicTerrainButton)
          {
            this.removeChild(_strategicTerrainButton);
            _strategicTerrainButton = null;
          }
          if (_gamingPieceSelectorButton)
          {
            this.removeChild(_gamingPieceSelectorButton);
            _gamingPieceSelectorButton = null;
          }
          if (_switchToSettlementButton)
          {
            this.removeChild(_switchToSettlementButton);
            _switchToSettlementButton = null;
          }
        }
        
        this.recalcView();
      }
    }
    
    that.updateView = function() {
      this.recalcView();            
      
      _super.updateView();
    }
    
    that.mapModeSwitched = function(mapMode) {
      if (_mapModeNormal)
      {
        this.removeChild(_strategicTerrainButton);
        _strategicTerrainButton = null;
      }
      else
      {
        this.removeChild(_normalTerrainButton);
        _normalTerrainButton = null;
      }
      
      _mapModeNormal = mapMode;
      
      this.recalcView();
    }
    
    /** checks for itself whether the view needs an update */
    that.updateIfNeeded = function() {
      var changed = false;
      
      // TODO      
      
      if (changed) { 
        this.setNeedsUpdate();
      }
      _super.updateIfNeeded();
    }
    
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));


