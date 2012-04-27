/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Military = (function(module) {
  
  module.createAttackArmyAction = function(army, targetArmyId, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.target_army_id = targetArmyId;
    my.army = army;

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'action_military_attack_army_action[army_id]='+my.army.get('id')+'&action_military_attack_army_action[target_army_id]=' + my.target_army_id; 
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'/military/attack_army_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        AWE.GS.ArmyManager.updateArmy(my.army.get('id'));
      }
    }
    
    that.army = function() {
      return my.army;
    }
  
    that.target_army_id = function() {
      return my.target_army_id;
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Military || {}));