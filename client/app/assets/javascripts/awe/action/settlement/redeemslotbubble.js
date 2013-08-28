/* Author: Christian Wansart <christian@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Settlement = (function(module) {
  
  module.createRedeemSlotBubbleAction = function(slotId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        redeem_slot_bubble_action: {
          slot_id: slotId,
        }
      } 
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE + '/settlement/redeem_slot_bubble_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200 || statusCode == 203) {
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Settlement || {}));
