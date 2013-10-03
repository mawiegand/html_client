/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  module.createConnectFacebookAction = function(fbPlayerId, fbAccessToken) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        connect_facebook_action: {
          fb_player_id:    fbPlayerId    || "",
          fb_access_token: fbAccessToken || "",
        },
      };
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'fundamental/connect_facebook_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
  
    return that;
  };

  return module;
  
}(AWE.Action.Fundamental || {}));