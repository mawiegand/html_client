/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Tutorial = (function(module) {
  
  module.createCheckQuestAction = function(questId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.questId = questId;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var requestBody = {
        action_tutorial_check_quest_action: {
          quest_id: my.questId,
        }
      };
      return requestBody;
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'tutorial/check_quest_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
  
    that.questId = function() {
      return my.questId;
    }
  
    return that;
    
  };
  

  module.createQuestDisplayedAction = function(questId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.questId = questId;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var requestBody = {
        tutorial_quest: {
          status: AWE.GS.TUTORIAL_STATUS_DISPLAYED,
        }
      };
      return requestBody;
    }
    
    that.getURL = function() {
      return AWE.Config.TUTORIAL_SERVER_BASE + 'quests/' + my.questId;
    }
  
    that.getHTTPMethod = function() {
      return 'PUT';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
  
    that.questId = function() {
      return my.questId;
    }
  
    return that;
    
  };
  
  return module;
  
}(AWE.Action.Tutorial || {}));