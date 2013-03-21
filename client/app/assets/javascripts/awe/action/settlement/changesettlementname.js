/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Settlement = (function(module) {
  
  module.createChangeSettlementNameAction = function(settlement, newName, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        settlement: {
          id: settlement.getId(),
          name: newName || "",
        }
      };
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'settlement/change_settlement_name_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        AWE.GS.SettlementManager.updateSettlement(settlement.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
          
        });
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Fundamental || {}));