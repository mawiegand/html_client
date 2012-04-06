/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Military = (function(module) {
  
  module.createChangeArmyNameAction = function(army, newName, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
    var _url = AWE.Config.ACTIONS_BASE+'military/change_army_name'
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return 'military_army[name]=' + newName; 
    }
    
    that.getURL = function() { return AWE.Config.MILITARY_SERVER_BASE+'/armies/'+army.get('id'); }
  
    that.getHTTPMethod = function() { return 'PUT'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        AWE.GS.ArmyManager.updateArmy(army.get('id'));
      }
    }
  
    return that;
    
  };

  return module;
  
}(AWE.Action.Military || {}));