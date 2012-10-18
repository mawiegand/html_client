/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {
          
  module.createControlButtonsView = function(spec, my) {

    var that;
    

    my = my || {};
    
    my.typeName = "ControlButtonsView";
    my.tutorialButtonView = null;
    
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

      if (!my.tutorialButtonView) {
        my.tutorialButtonView = AWE.UI.createButtonView();
        my.tutorialButtonView.initWithControllerTextAndImage(my.controller, AWE.I18n.lookupTranslation('map.button.quests'), AWE.UI.ImageCache.getImage("ui/button/standard/normal"));
        my.tutorialButtonView.setImageForState(AWE.UI.ImageCache.getImage("ui/button/standard/hovered"), module.CONTROL_STATE_HOVERED);
        my.tutorialButtonView.setFrame(AWE.Geometry.createRect(0, 0, 72, 72));
        my.tutorialButtonView.onClick = function() {
          WACKADOO.showQuestListDialog();
          AWE.GS.TutorialStateManager.checkForCustomTestRewards('quest_quest_button');          
        };
        this.addChild(my.tutorialButtonView);
      }
      if (AWE.GS.TutorialStateManager.getTutorialState()) {
        var openQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('openQuestStateCount');
        var allQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('notClosedQuestStateCount');
        var string = "Quests";
        if (openQuestStates !== undefined && allQuestStates !== undefined && allQuestStates > 0) {
          string += "\n(" + openQuestStates + "/" + allQuestStates + ")";
        }
        if (string !== my.tutorialButtonView.text()) {
          my.tutorialButtonView.setText(string);
        }
      }      
      
      
    };
    
    that.updateView = function() {
      this.recalcView();
      _super.updateView();
    }
    
    /** checks for itself whether the view needs an update (changed reosources) or not. */
    that.updateIfNeeded = function() {
      var changed = false;
      
      if (AWE.GS.TutorialStateManager.getTutorialState()) {
        var openQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('openQuestStateCount');
        var allQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('notClosedQuestStateCount');
        var string = "Quests";
        if (openQuestStates !== undefined && allQuestStates !== undefined && allQuestStates > 0) {
          string += "\n(" + openQuestStates + "/" + allQuestStates + ")";
        }
        changed = changed || (string !== my.tutorialButtonView.text());
      }      
      
      if (changed) {
        this.setNeedsUpdate();
      }
      
      _super.updateIfNeeded();
    }
    
    return that;
  };
  
  return module;
    
}(AWE.UI || {}));


