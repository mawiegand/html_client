/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Military = (function(module) {
  
  module.createChangeArmyStanceAction = function(army, stance, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        military_army: {
          stance: stance,
        }
      } 
    }
    
    that.getURL = function() { return AWE.Config.MILITARY_SERVER_BASE+'/armies/'+army.getId(); }
  
    that.getHTTPMethod = function() { return 'PUT'; }
    
    that.postProcess = function(statusCode, xhr) {
      AWE.GS.ArmyManager.updateArmy(army.getId());
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Military || {}));