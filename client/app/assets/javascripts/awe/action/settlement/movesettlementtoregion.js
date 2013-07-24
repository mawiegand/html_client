/* Author: Marcel Wiegand  <marcel@5dlab.com>
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Settlement = (function(module) {
  
  module.createMoveSettlementToRegionAction = function(regionName, regionPassword, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        move_settlement_action: {
          region_name: regionName,
          region_password: regionPassword,
        }
      } 
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE + '/settlement/move_settlement_to_region_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200 || statusCode == 203) {
        ///\todo
        //AWE.GS.SettlementManager.updateSettlement(settlement.getId());
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Settlement || {}));