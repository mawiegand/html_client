/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Military = (function(module) {
  
  module.createChangeArmyAction = function(location, visibleArmy, units, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.location = location;
    my.visibleArmy = visibleArmy;
    my.units = units;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var requestBody = 'action_military_change_army_action[location_id]=' + my.location.id() +
                        '&action_military_change_army_action[visible_army_id]=' + my.visibleArmy.getId();
      
      AWE.Ext.applyFunctionToHash(my.units, function(symbolicId, quantity) {
        requestBody += '&action_military_change_army_action[' + symbolicId + ']=' + quantity;
      })
      
      return requestBody;
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + '/military/change_army_actions';
    }
  
    that.getHTTPMethod = function() {
      return 'POST';
    }
    
    that.postProcess = function(statusCode, xhr) {
    }
    
    that.location = function() {
      return my.location;
    }
  
    that.units = function() {
      return my.units;
    }
  
    return that;
    
  };
  
  return module;
  
}(AWE.Action.Military || {}));