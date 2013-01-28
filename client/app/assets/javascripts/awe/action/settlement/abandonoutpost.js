/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Settlement = (function(module) {
  
  module.createAbandonOutpostAction = function(settlement, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        abandon_outpost_action: {
          settlement_id: settlement.getId(),
        }
      } 
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE + '/settlement/abandon_outpost_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200 || statusCode == 203) {
        AWE.GS.SettlementManager.updateSettlement(settlement.getId());
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Settlement || {}));