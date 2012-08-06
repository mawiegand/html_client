/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Settlement = (function(module) {
  
  module.createChangeTaxRateAction = function(settlement, newTaxRate, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        tax_rate_action: {
          settlement_id: settlement.getId(),
          tax_rate:      newTaxRate,
        }
      } 
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE + '/settlement/change_tax_rate_actions'; }
  
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