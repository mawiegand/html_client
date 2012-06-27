/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  module.runUpdatesAfterAllianceChange = function() {
    var characterId = AWE.GS.player.getPath('currentCharacter.id')
    AWE.GS.CharacterManager.updateCurrentCharacter();
    AWE.GS.ResourcePoolManager.updateResourcePool();
    AWE.GS.ArmyManager.updateArmiesForCharacter(characterId);
        // update everything that is related to alliance-boni (e.g. resource pool)
        // update all settlements and even the regions!
  };
  
  
  ////////////////////////////////////////////////////////////////////////////
  //
  //  CREATE ALLIANCE
  //
  ////////////////////////////////////////////////////////////////////////////

  module.createCreateAllianceAction = function(tag, name, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.allianceTag  = tag  || "";
    my.allianceName = name || "";
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'alliance[tag]=' + escape(my.allianceTag) + '&alliance[name]=' + escape(my.allianceName); 
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/create_alliance_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.CREATED) {
        module.runUpdatesAfterAllianceChange();
      }
    }  
    return that;
  };
  
  ////////////////////////////////////////////////////////////////////////////
  //
  //  JOIN ALLIANCE
  //
  ////////////////////////////////////////////////////////////////////////////

  module.createJoinAllianceAction = function(tag, password, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.allianceTag     = tag  || "";
    my.alliancePasword = password || "";
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'alliance[tag]=' + escape(my.allianceTag) + '&alliance[password]='+escape(password); 
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/join_alliance_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.OK) {
        module.runUpdatesAfterAllianceChange();
      }
    }  
    return that;
  };
  
  
  
  ////////////////////////////////////////////////////////////////////////////
  //
  //  LEAVE ALLIANCE
  //
  ////////////////////////////////////////////////////////////////////////////  
  
  module.createLeaveAllianceAction = function(allianceId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.allianceId = allianceId || 0;

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'leave_alliance_action[alliance_id]=' + escape(my.allianceId); 
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/leave_alliance_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode === AWE.Net.OK) {
        module.runUpdatesAfterAllianceChange();
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Fundamental || {}));