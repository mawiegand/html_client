/* Author: Patrick Fox <patrick@5dlab.com>
 *         Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createTempToggleButtonView = function(spec, my) {

    var that;
    
    var worldMap = false;

    my = my || {};

    my.toggleButtonView = null;

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    that.recalcView = function() {
      
      if (!my.toggleButtonView) {
        my.toggleButtonView = AWE.UI.createButtonView();
        my.toggleButtonView.initWithControllerTextAndImage(my.controller, AWE.I18n.lookupTranslation('map.button.game'), AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        my.toggleButtonView.setFrame(AWE.Geometry.createRect(0, 0, 48, 48));
        my.toggleButtonView.onClick = function() {
          that.onToggleButtonClick()
        };
        this.addChild(my.toggleButtonView);
      }
      
      my.toggleButtonView.setText(worldMap ? AWE.I18n.lookupTranslation('map.button.world') : AWE.I18n.lookupTranslation('map.button.game'));
    }
    
    that.onToggleButtonClick = function() {
      worldMap = !worldMap;
      my.controller.switchMapMode(worldMap);
      this.recalcView() 
    }
    
    that.updateView = function() {
      this.recalcView() 
      _super.updateView();
    };   
    
    return that;
  };
  
  
  module.createMapTypeToggleButtonView = function(spec, my) {

    var that;
    
    var politicalMap = false;

    my = my || {};

    my.toggleButtonView = null;

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    that.recalcView = function() {
      
      if (!my.toggleButtonView) {
        my.toggleButtonView = AWE.UI.createButtonView();
        my.toggleButtonView.initWithControllerTextAndImage(my.controller, "", AWE.UI.ImageCache.getImage("ui/button/mapstrategy/normal"));
        my.toggleButtonView.setFrame(AWE.Geometry.createRect(0, 0, 68, 70));
        my.toggleButtonView.onClick = function() {
          that.onToggleButtonClick()
        };
        this.addChild(my.toggleButtonView);
      }

      if (my.toggleButtonView) {
        if (politicalMap) {
          my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/mapterrain/normal"), module.CONTROL_STATE_NORMAL);
          my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/mapterrain/hover"), module.CONTROL_STATE_HOVERED);
        }
        else {
          my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/mapstrategy/normal"), module.CONTROL_STATE_NORMAL);
          my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/mapstrategy/hover"), module.CONTROL_STATE_HOVERED);
        }
      }
    }
    
    that.onToggleButtonClick = function() {
      my.controller.switchMapType();
      this.recalcView() 
    }
    
    that.updateView = function() {
      this.recalcView() 
      _super.updateView();
    };   
    
    return that;
  };  
  
  
  module.createEncyclopediaButtonView = function(spec, my) {

    var that;
    
    my = my || {};

    my.toggleButtonView = null;

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    that.recalcView = function() {
      if (!my.toggleButtonView) {
        my.toggleButtonView = AWE.UI.createButtonView();
        my.toggleButtonView.initWithControllerTextAndImage(my.controller, "", AWE.UI.ImageCache.getImage("ui/button/mapency/normal"));
        my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/mapency/hover"), module.CONTROL_STATE_HOVERED);
        my.toggleButtonView.setFrame(AWE.Geometry.createRect(0, 0, 68, 70));
        my.toggleButtonView.onClick = function() {
          that.onToggleButtonClick()
        };
        this.addChild(my.toggleButtonView);
      }      
    }
    
    that.onToggleButtonClick = function() {
      WACKADOO.openEncyclopedia();
    }
    
    that.updateView = function() {
      this.recalcView() 
      _super.updateView();
    };   
    
    return that;
  };
  
  
  module.createArmyVisibilityButtonView = function(spec, my) {

    var that;
    
    my = my || {};

    my.toggleButtonView = null;

    that = module.createContainer(spec, my);

    var _super = {
      initWithController: AWE.Ext.superior(that, "initWithController"),
      updateView: AWE.Ext.superior(that, "updateView"),
    };
    
    that.recalcView = function() {
      if (!my.toggleButtonView) {
        my.toggleButtonView = AWE.UI.createButtonView();
        my.toggleButtonView.initWithControllerTextAndImage(my.controller, "", AWE.UI.ImageCache.getImage("ui/button/visibility/normal"));
        my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/visibility/hover"), module.CONTROL_STATE_HOVERED);
        my.toggleButtonView.setFrame(AWE.Geometry.createRect(0, 0, 68, 70));
        my.toggleButtonView.onClick = function() {
          that.onToggleButtonClick()
        };
        this.addChild(my.toggleButtonView);
      }      
    }
    
    that.onToggleButtonClick = function() {
      my.controller.toggleArmyVisibility();
      this.recalcView();
    }
    
    that.updateView = function() {
      this.recalcView() 
      _super.updateView();
    };   
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));









