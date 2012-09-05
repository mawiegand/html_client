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
        my.toggleButtonView.initWithControllerTextAndImage(my.controller, 'Game', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        my.toggleButtonView.setFrame(AWE.Geometry.createRect(0, 0, 48, 48));
        my.toggleButtonView.onClick = function() {
          that.onToggleButtonClick()
        };
        this.addChild(my.toggleButtonView);
      }
      
      my.toggleButtonView.setText(worldMap ? 'World' : 'Game');
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
        my.toggleButtonView.initWithControllerTextAndImage(my.controller, 'Strategic', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        my.toggleButtonView.setFrame(AWE.Geometry.createRect(0, 0, 48, 48));
        my.toggleButtonView.onClick = function() {
          that.onToggleButtonClick()
        };
        this.addChild(my.toggleButtonView);
      }
      
      my.toggleButtonView.setText(politicalMap ? 'Terrain' : 'Strategic');
    }
    
    that.onToggleButtonClick = function() {
      politicalMap = !politicalMap;
      my.controller.switchMapType(politicalMap);
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
        my.toggleButtonView.initWithControllerTextAndImage(my.controller, 'Encyclopedia', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        my.toggleButtonView.setFrame(AWE.Geometry.createRect(0, 0, 48, 48));
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
  
  module.createQuestListButtonView = function(spec, my) {

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
        my.toggleButtonView.initWithControllerTextAndImage(my.controller, 'Quests', AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        my.toggleButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        my.toggleButtonView.setFrame(AWE.Geometry.createRect(0, 0, 48, 48));
        my.toggleButtonView.onClick = function() {
          that.onToggleButtonClick()
        };
        this.addChild(my.toggleButtonView);
      } 
      
      if (AWE.GS.TutorialStateManager.getTutorialState()) {
        var openQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('openQuestStateCount');
        var allQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('notClosedQuestStateCount');
        var string = "Quests";
        if (openQuestStates !== undefined && allQuestStates !== undefined && allQuestStates > 0) {
          string += "\n(" + openQuestStates + "/" + allQuestStates + ")";
        }
        if (string !== my.toggleButtonView.text()) {
          my.toggleButtonView.setText(string);
        }
      }      
    }
    
    that.onToggleButtonClick = function() {
      WACKADOO.showQuestListDialog();
    }
    
    that.updateView = function() {
      this.recalcView() 
      _super.updateView();
    };   
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));









