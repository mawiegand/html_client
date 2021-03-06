/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};
AWE.Action = AWE.Action || {};

AWE.Action.Military = (function(module) {
  
  module.createFoundOutpostAction = function(army, location, my) {
      
    // private attributes and methods //////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods ////////////////////////////////////
  
    my = my || {};
    my.location = location;
    my.army = army;

    
    // public attributes and methods ///////////////////////////////////////
    
    that = AWE.Action.createAction(my);    
    
    that.getRequestBody = function() {
      return { 
        found_outpost_action: {
          army_id:            my.army.getId(),
          location_id: my.location.id(),
        }
      };
    }
    
    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'/military/found_outpost_actions'; }
  
    that.getHTTPMethod = function() { return 'POST'; }
    
    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        AWE.GS.ArmyManager.updateArmy(my.army.getId());
        AWE.GS.CharacterManager.updateCharacter(army.get('owner_id'));
      }
    }
    
    that.army = function() {
      return my.army;
    }
  
    that.target_location_id = function() {
      return my.target_location_id;
    }
  
    return that;
    
  };

  module.createFoundHomebaseAction = function(army, location, my) {

    // private attributes and methods //////////////////////////////////////

    var that;


    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    my.location = location;
    my.army = army;


    // public attributes and methods ///////////////////////////////////////

    that = AWE.Action.createAction(my);

    that.getRequestBody = function() {
      return {
        found_home_base_action: {
          army_id:     my.army.getId(),
          location_id: my.location.id(),
        }
      };
    }

    that.getURL = function() { return AWE.Config.ACTION_SERVER_BASE+'/military/found_home_base_actions'; };

    that.getHTTPMethod = function() { return 'POST'; }

    that.postProcess = function(statusCode, xhr) {
      if (statusCode == 200) {
        AWE.GS.ArmyManager.updateArmy(my.army.getId());
        AWE.GS.CharacterManager.updateCharacter(army.get('owner_id'));
      }
    }

    that.army = function() {
      return my.army;
    }

    that.target_location_id = function() {
      return my.target_location_id;
    }

    return that;
  };

  return module;
  
}(AWE.Action.Military || {}));