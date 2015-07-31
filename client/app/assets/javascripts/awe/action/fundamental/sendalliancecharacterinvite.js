/* Author: Marcel Wiegand <marcel@5dlab.com>
 * Copyright (C) 2015 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  module.createSendAllianceCharacterInviteAction = function(characterInviteName, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        send_alliance_character_invite_action: {
		  character_invite_name: characterInviteName,
        }
      };
    }

    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/send_alliance_character_invite_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Fundamental || {}));
