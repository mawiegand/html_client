/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Military = (function(module) {
  
  module.createRetreatArmyAction = function(army, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.army = army;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'action_military_retreat_army_action[army_id]=' + my.army.getId() +
        '&action_military_retreat_army_action[retreat]=' + !my.army.get('battle_retreat');
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + '/military/retreat_army_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
    
    that.army = function() {
      return my.army;
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Military || {}));