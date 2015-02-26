/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Extras = (function(module) {
  
  module.createRedeemRetentionAction = function(my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {};
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'/fundamental/redeem_retention_bonus_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      // if (statusCode == 200) {
        // AWE.GS.ArmyManager.updateArmy(my.army.getId());
      // }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Military || {}));