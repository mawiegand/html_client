/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Trading = (function(module) {
  
  module.createSendTradingCartsAction = function(settlementId, recipientName, resources, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.settlementId  = settlementId;
    my.recipientName = recipientName || "";
    my.resources     = resources     || [];

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var action = {
          settlement_id:  my.settlementId,
          recipient_name: my.recipientName,
      }
      
      my.resources.forEach(function(item) {
        var amount = parseInt(item.amount || "0");
        if (amount > 0) {
          action[item.type.symbolic_id + '_amount'] = amount;
        }
      });
      
      return { 
        trading_carts_action: action
      };
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'/trading/trading_carts_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
    }
    
    return that;
    
  };
  
  
  module.createTradingCartCancelAction = function(actionId, my) {
      
    // private attributes and methods //////////////////////////////////////
    var that;
    
    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.actionId = actionId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return null;
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'trading/trading_carts_actions/' + actionId;
    }
  
    that.getHTTPMethod = function() {
      return 'DELETE';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
    
    return that;
  };
  
  module.createTradingCartSpeedupAction = function(actionId, my) {

    // private attributes and methods //////////////////////////////////////
    var that;

    // protected attributes and methods ////////////////////////////////////
    my = my || {};
    my.actionId = actionId;

    // public attributes and methods ///////////////////////////////////////
    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
//      return null;
      return {
        action_trading_speedup_trading_carts: {
          trading_carts_action_id: my.actionId,
        }
      };
    }

    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + 'trading/speedup_trading_carts_actions';
    }

    that.getHTTPMethod = function() {
      return 'POST';
    }

    that.postProcess = function(statusCode, xhr) {
    }

    return that;
  };

  return module;
  
}(AWE.Action.Trading || {}));