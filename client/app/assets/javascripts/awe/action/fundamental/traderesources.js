/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Fundamental = (function(module) {
  
  module.createTradeResourcesAction = function(stone, wood, fur, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
      
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return {
        resource_stone: stone || 0.0,
        resource_wood:  wood  || 0.0,
        resource_fur:   fur   || 0.0,
      };
    }

    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'fundamental/trade_resources_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        /* the update happens in awe/UI/ember/resourceexchange.js */
        AWE.GS.ResourcePoolManager.updateResourcePool();
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Fundamental || {}));
