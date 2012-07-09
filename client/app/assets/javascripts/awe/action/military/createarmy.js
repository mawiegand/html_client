/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Military = (function(module) {
  
  module.createCreateArmyAction = function(location, units, armyName, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.location = location;
    my.units = units;
    my.armyName = armyName;
    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      var requestBody = 'action_military_create_army_action[location_id]=' + my.location.id() + 
                        '&action_military_create_army_action[army_name]=' + my.armyName;
      
      AWE.Ext.applyFunctionToHash(my.units, function(symbolicId, quantity) {
        if (quantity > 0) {
          requestBody += '&action_military_create_army_action[' + symbolicId + ']=' + quantity;
        }
      })
      
      return requestBody;
    }
    
    that.getURL = function() {
      return AWE.Config.ACTION_SERVER_BASE + '/military/create_army_actions';
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