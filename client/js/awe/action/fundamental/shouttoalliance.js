/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  module.createShoutToAllianceAction = function(message, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'fundamental_alliance_shout[message]=' + message; 
    }
    
    that.getURL = function() { return AWE.Config.FUNDAMENTAL_SERVER_BASE+'/alliance_shouts/'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
//        AWE.GS.ArmyManager.updateArmy(army.get('id'));  -> no update, presently cannot be bound :-(   (wait for ObjectProxy in EmberJS)
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Fundamental || {}));