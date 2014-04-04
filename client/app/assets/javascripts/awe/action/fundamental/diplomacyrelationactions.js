/* Author: Marcel Wiegand <marcel@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  module.createDiplomacyRelationAction = function(sourceAllianceId, targetAllianceName, diplomacyStatus, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        diplomacy_relation_action: {
          source_alliance_id: sourceAllianceId,
          target_alliance_name: targetAllianceName,
          diplomacy_status: diplomacyStatus,
        }
      };
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/diplomacy_relation_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        AWE.GS.DiplomacyRelationManager.updateDiplomacyRelationsOfAlliance(AWE.GS.game.getPath('currentCharacter.alliance_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Fundamental || {}));