/* Author: Jona Boeddinghaus <jona@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.UI = (function(module) {

  module.createRightHUDControlsView = function(spec, my) {

    var that;
    
    var _mailButton;
    var _mailCountButton;
    var _questsButton;
    var _questsCountButton;
    
    my = my || {};
    
    my.typeName = "RightHUDControlsView";
    
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
      my.container.width  = my.frame.size.width;
      my.container.height = my.frame.size.height;
      my.container.scaleX = AWE.Settings.hudScale;
      my.container.scaleY = AWE.Settings.hudScale;
    }
    
    that.recalcView = function() {

      if (!_mailButton) {
        _mailButton = AWE.UI.createButtonView();
        _mailButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/message/normal"));
        _mailButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/message/hover"), module.CONTROL_STATE_HOVERED);
        _mailButton.setFrame(AWE.Geometry.createRect(0, 0, 52, 52));
        _mailButton.onClick = function() {
          my.controller.mailButtonClicked();
        };
        this.addChild(_mailButton);
      }  
      
      var unread = AWE.GS.CharacterManager.getCurrentCharacter().getPath('inbox.unread_messages_count');
      if (unread !== undefined && unread > 0) {
        if (!_mailCountButton) {
          _mailCountButton = AWE.UI.createButtonView();
          _mailCountButton.initWithControllerTextAndImage(my.controller, ''+unread, AWE.UI.ImageCache.getImage("hud/button/count_indicator"));
          _mailCountButton.setFrame(AWE.Geometry.createRect(37, 10, 34, 32));
          _mailCountButton.setFont("bold 16px HVDComicSerifPro");
          _mailCountButton.setShadowEnabled(true);
          this.addChild(_mailCountButton);
        }
      }
      else if (_mailCountButton) {
        this.removeChild(_mailCountButton);
        _mailCountButton = null;        
      }
  
      if (!_questsButton) {
        _questsButton = AWE.UI.createButtonView();
        _questsButton.initWithControllerTextAndImage(my.controller, null, AWE.UI.ImageCache.getImage("hud/button/quest_list/normal"));
        _questsButton.setImageForState(AWE.UI.ImageCache.getImage("hud/button/quest_list/hover"), module.CONTROL_STATE_HOVERED);
        _questsButton.setFrame(AWE.Geometry.createRect(0, 82, 52, 52));
        _questsButton.onClick = function() {
          my.controller.questsButtonClicked();
        };
        this.addChild(_questsButton);
      }  
      
      if (AWE.GS.TutorialStateManager.getTutorialState()) {
        var allQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('notClosedQuestStateCount');
        if (allQuestStates !== undefined && allQuestStates > 0) {
          if (!_questsCountButton) {
            _questsCountButton = AWE.UI.createButtonView();
            _questsCountButton.initWithControllerTextAndImage(my.controller, ''+allQuestStates, AWE.UI.ImageCache.getImage("hud/button/count_indicator"));
            _questsCountButton.setFrame(AWE.Geometry.createRect(37, 92, 34, 32));
            _questsCountButton.setFont("bold 16px HVDComicSerifPro");
            _questsCountButton.setShadowEnabled(true);
            this.addChild(_questsCountButton);
          }
          if (''+allQuestStates !== _questsCountButton.text()) {
            _questsCountButton.setText(''+allQuestStates);
          }
        }
        else if (_questsCountButton) {
          this.removeChild(_questsCountButton);
          _questsCountButton = null;
        }
      }               
    };        
    
    that.updateView = function() {
      this.recalcView();            
      
      _super.updateView();
    }
    
    /** checks for itself whether the view needs an update */
    that.updateIfNeeded = function() {
      var changed = false;
      
      if (!changed && AWE.GS.CharacterManager.getCurrentCharacter()) {
        var unread = AWE.GS.CharacterManager.getCurrentCharacter().getPath('inbox.unread_messages_count');
        if (unread !== undefined && unread > 0) {
          changed = changed || !_mailCountButton || (''+unread !== _mailCountButton.text());
        }
        else {
          changed = changed || _mailCountButton;
        }
      }  
      
      if (!changed && AWE.GS.TutorialStateManager.getTutorialState()) {
        var allQuestStates = AWE.GS.TutorialStateManager.getTutorialState().get('notClosedQuestStateCount');
        if (allQuestStates !== undefined && allQuestStates !== null) {
          changed = changed || !_questsCountButton || (''+allQuestStates !== _questsCountButton.text());
        }
        else {
          changed = changed || _questsCountButton;
        }
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


