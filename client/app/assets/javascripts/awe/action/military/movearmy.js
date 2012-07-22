/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Military = (function(module) {
  
  module.createMoveArmyAction = function(army, target_location_id, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.target_location_id = target_location_id;
    my.army = army;

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return { 
        action_military_move_army_action: {
          army_id:            my.army.getId(),
          target_location_id: my.target_location_id,
        }
      };
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'/military/move_army_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      // if (statusCode == 200) {
        // AWE.GS.ArmyManager.updateArmy(my.army.getId());
      // }
    }
    
    that.army = function() {
      return my.army;
    }
  
    that.target_location_id = function() {
      return my.target_location_id;
    }
  
    return that;
    
  };
  
  
  
  module.createCancelMoveArmyAction = function(army, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.army = army;

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'action_military_cancel_move_army_action[army_id]='+my.army.getId(); 
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'/military/cancel_move_army_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      // if (statusCode == 200) {
        // AWE.GS.ArmyManager.updateArmy(my.army.getId());
      // }
    }
    
    that.army = function() {
      return my.army;
    }

  
    return that;
    
  };

  return module;
  
}(AWE.Action.Military || {}));