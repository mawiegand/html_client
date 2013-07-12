/* Author: Christian Wansart <christian@5dlab.com>
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  /**
   *  CREATE / SAVE NEW AVATAR
   */
  module.createChangeAvatarAction = function(newAvatar, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        avatar_string: newAvatar,
      };
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/change_avatar_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
      }
    }
  
    return that;
    
  };


  /**
   *  GET NEW AVATAR
   */
  module.getNewAvatarAction = function(my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
      };
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/change_avatar_actions'; }
  
    that.getHTTPMethod = function() { return 'GET'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
      }
    }
  
    return that;
    
  };
  return module;
  
}(AWE.Action.Fundamental || {}));
