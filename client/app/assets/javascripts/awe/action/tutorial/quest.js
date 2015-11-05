/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Tutorial = (function(module) {
  
  module.createCheckQuestAction = function(questId, answerText, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;

    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.questId = questId;
    my.answerText = answerText;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var requestBody = {
        action_tutorial_check_quest_action: {
          quest_id: my.questId,
        }
      };
      
      if (my.answerText != null && my.answerText != undefined) {
        requestBody.action_tutorial_check_quest_action['answer_text'] = my.answerText;
      }
      
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
  
    that.answerText = function() {
      return my.answerText;
    }
  
    return that;
    
  };
  
  module.createRedeemRewardsAction = function(questStateId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.questStateId = questStateId;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var requestBody = {
        action_tutorial_redeem_rewards_action: {
          quest_state_id: my.questStateId,
        }
      };
      return requestBody;
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'tutorial/redeem_rewards_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
  
    that.questId = function() {
      return my.questStateId;
    }
  
    return that;
    
  };
  
  module.createRedeemTutorialEndRewardsAction = function(my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {};
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'tutorial/redeem_tutorial_end_rewards_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }
    }
  
    that.questId = function() {
      return my.questStateId;
    }
  
    return that;
    
  };
  
  module.createQuestDisplayedAction = function(questStateId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.questStateId = questStateId;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var requestBody = {
        tutorial_quest: {
          status: AWE.GS.QUEST_STATUS_DISPLAYED,
        }
      };
      return requestBody;
    }
    
    that.getURL = function() {
      return AWE.Config.TUTORIAL_SERVER_BASE + 'quests/' + my.questStateId;
    }
  
    that.getHTTPMethod = function() {
      return 'PUT';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
  
    that.questStateId = function() {
      return my.questStateId;
    }
  
    return that;
  };

//#################
//#################
  module.createQuestRewardDisplayedAction = function(questStateId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.questStateId = questStateId;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var requestBody = {
        action_tutorial_mark_quest_reward_displayed_action: {
          quest_id: my.questStateId,
        }
      };
      return requestBody;
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'tutorial/mark_quest_reward_displayed_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
  
    that.questStateId = function() {
      return my.questStateId;
    }
  
    return that;
  };

  module.createCavePaintingDisplayedAction = function(questStateId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.questStateId = questStateId;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var requestBody = {
        action_tutorial_mark_cave_painting_displayed_action: {
          quest_id: my.questStateId,
        }
      };
      return requestBody;
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'tutorial/mark_cave_painting_displayed_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
  
    that.questStateId = function() {
      return my.questStateId;
    }
  
    return that;
  };

  
  return module;
  
}(AWE.Action.Tutorial || {}));