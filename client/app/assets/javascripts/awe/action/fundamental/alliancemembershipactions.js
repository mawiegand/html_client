/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  module.runUpdatesAfterAllianceChange = function() {
    var characterId = AWE.GS.game.getPath('currentCharacter.id');
    AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
      var allianceId = AWE.GS.game.getPath('currentCharacter.alliance_id');
      if (allianceId) {
        AWE.GS.AllianceManager.updateAlliance(AWE.GS.game.getPath('currentCharacter.alliance_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }
    });
    AWE.GS.ResourcePoolManager.updateResourcePool();
    AWE.GS.SettlementManager.getOwnSettlements();
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
      return {
        alliance: {
          tag:  my.allianceTag,
          name: my.allianceName,
        }
      };
    };
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'fundamental/create_alliance_actions';
    };
  
    that.getHTTPMethod = function() {
      return 'POST';
    };
    
    that.postProcess = function(statusCode) {
      if (statusCode === AWE.Net.CREATED) {
        module.runUpdatesAfterAllianceChange();
        WACKADOO.chatRoom(my.allianceTag, 'join');
      }
    };

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
    my.allianceTag      = tag  || "";
    my.alliancePassword = password || "";
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return { 
        alliance: {
          tag:      my.allianceTag,
          password: my.alliancePassword,
        }
      }; 
    };
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'fundamental/join_alliance_actions';
    };
  
    that.getHTTPMethod = function() { return 'POST'; };
    
    that.postProcess = function(statusCode) {
      if (statusCode === AWE.Net.OK || statusCode === AWE.Net.CREATED) {
        module.runUpdatesAfterAllianceChange();
        WACKADOO.chatRoom(my.allianceTag, 'join');
      }
    };
    return that;
  };
  

  ////////////////////////////////////////////////////////////////////////////
  //
  //  KICK ALLIANCE MEMBER
  //
  ////////////////////////////////////////////////////////////////////////////  
  
  module.createKickAllianceMemberAction = function(characterId, allianceId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.characterId = characterId || 0;
    my.allianceId  = allianceId || 0;

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return { 
        kick_action: {
          character_id: my.characterId 
        }
      }; 
    };
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/kick_alliance_member_actions'; };
  
    that.getHTTPMethod = function() { return 'POST'; };
    
    that.postProcess = function(statusCode) {
      if (statusCode === AWE.Net.OK || statusCode === AWE.Net.CREATED) {
        AWE.GS.CharacterManager.updateCharacter(characterId); // this update will delete the character from the members list, as his alliance_id has changed.
      }
    };
  
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
      return {
        leave_alliance_action: {
          alliance_id: my.allianceId
        }
      };
    };
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/leave_alliance_actions'; };
  
    that.getHTTPMethod = function() { return 'POST'; };
    
    that.postProcess = function(statusCode) {
      if (statusCode === AWE.Net.OK || statusCode === AWE.Net.CREATED) {
        module.runUpdatesAfterAllianceChange();
        WACKADOO.chatRoom(AWE.GS.AllianceManager.getAlliance(my.allianceId).tag, 'leave');
      }
    };
  
    return that;
  };


  ////////////////////////////////////////////////////////////////////////////
  //
  //  CREATE ALLIANCE RESERVATION
  //
  ////////////////////////////////////////////////////////////////////////////

  module.createCreateAllianceReservationAction = function(allianceId, password, my) {

    // private attributes and methods //////////////////////////////////////

    var that;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    my.allianceId = allianceId || 0;
    my.password   = password || 0;


    // public attributes and methods ///////////////////////////////////////

    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        fundamental_alliance_reservation: {
          password: my.password
        }
      };
    };

    that.getURL = function() {
      return AWE.Config.FUNDAMENTAL_SERVER_BASE + 'alliances/' + my.allianceId + '/alliance_reservation';
    };

    that.getHTTPMethod = function() {
      return 'POST';
    };

    that.postProcess = function(statusCode) {
    };

    return that;

  };


  ////////////////////////////////////////////////////////////////////////////
  //
  //  UPDATE ALLIANCE RESERVATION
  //
  ////////////////////////////////////////////////////////////////////////////

  module.createUpdateAllianceReservationAction = function(allianceReservationId, password, my) {

    // private attributes and methods //////////////////////////////////////

    var that;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    my.allianceReservationId = allianceReservationId || 0;
    my.password = password || 0;


    // public attributes and methods ///////////////////////////////////////

    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        fundamental_alliance_reservation: {
          password: my.password
        }
      };
    };

    that.getURL = function() {
      return AWE.Config.FUNDAMENTAL_SERVER_BASE + 'alliance_reservations/' + my.allianceReservationId;
    };

    that.getHTTPMethod = function() {
      return 'PUT';
    };

    that.postProcess = function(statusCode, xhr) {
    };

    return that;

  };

  return module;
  
}(AWE.Action.Fundamental || {}));