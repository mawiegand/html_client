/* Author: Christian Wansart <christian@5dlab.com>
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  module.createChangeAllianceAutoJoinAction = function(allianceId, autoJoinSetting, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        change_alliance_auto_join_action: {
          alliance_id: allianceId,
          auto_join_setting: autoJoinSetting ? 1 : 0,
        }
      };
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/change_alliance_auto_join_setting_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        AWE.GS.AllianceManager.updateAlliance(AWE.GS.game.getPath('currentCharacter.alliance_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Fundamental || {}));
