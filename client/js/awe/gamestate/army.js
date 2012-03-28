/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState base class, manager and helpers. */
AWE.GS = (function(module) {

  /** Base class of all classes that represent states & entities of the game. */
  module.createArmy = function(my) {
    
    // private attributes and methods ////////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods //////////////////////////////////////
  
    my = my || {};
    
    
    // public attributes and methods /////////////////////////////////////////
    
    that = module.createEntity(my);
  
    
    // synthesized properties ////////////////////////////////////////////////

    that.property('name',         null, module.PROPERTY_READ_ONLY);

    that.property('location_id',  null, module.PROPERTY_READ_ONLY);  ///< present whereabouts of the army
    that.property('region_id',    null, module.PROPERTY_READ_ONLY);  ///< present whereabouts of the army
    that.property('owner_id',     null, module.PROPERTY_READ_ONLY);
    that.property('owner_name',   null, module.PROPERTY_READ_ONLY);
    that.property('alliance_id',  null, module.PROPERTY_READ_ONLY);
    that.property('alliance_tag', null, module.PROPERTY_READ_ONLY);

    that.toString = function() {
      return "army " + this.id() + ", " + this.name() + " at " + this.region_id() + "/" + this.location_id();
    }

    return that;
  };
  
  module.armyManager = (function(my) {
    
    // private attributes and methods ////////////////////////////////////////
    
    var that;
    
  
    // protected attributes and methods //////////////////////////////////////
  
    my = my || {};
    
    my.armies = {};                   ///< holds all available information about armies
    my.ownArmies = {};                ///< the player's own armies (reference to same object as in armies)
    my.runningUpdatesPerId = {};      ///< hash that contains all running update requests, using the army.id as key.
    my.runningUpdatesPerRegion = {};  ///< hash that contains all running requests for regions, using the region.id as key.
    my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
    
    my.updateTypeQueryToken = function(updateType) {
      if (updateType === module.ENTITY_UPDATE_TYPE_SHORT) {
        return "short=1";
      }
      else if (updateType === module.ENTITY_UPDATE_TYPE_AGGREGATE) {
        return "aggregate=1";
      }
      else {
        return "";
      }
    }
    
    my.tryRegisterRequest = function(queue, id, updateType) {
      if (queue[id] && queue[id].updateType >= updateType) { // same (or higher) type of update is already running
        return false;                                        // could not register this update; thus, should not be executed
      }
      
      queue[id] = { started: new Date(), updateType: updateType };
      return true;
    }
    
    my.unregisterRequest = function(queue, id, updateType) {
      if (queue[id] && queue[id].updateType === updateType) { // check that same type of update (a higher-level update may have overwritten a lower-level update)
        delete queue[id];
      }
    }
    
    
    // public attributes and methods /////////////////////////////////////////
    
    that = {};
    
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateArmy = function(id, updateType, callback) {
      if (updateType === undefined) { 
        updateType = module.ENTITY_UPDATE_TYPE_FULL;
      }
      
      if (my.tryRegisterRequest(my.runningUpdatesPerId, id, updateType)) {
        var start = new Date();
        var url = AWE.Config.MILITARY_SERVER_BASE+'armies/'+id+'.json?'+my.updateTypeQueryToken(updateType);
        
        console.log ('update type: ' + updateType + ' token: '+ my.updateTypeQueryToken(updateType) + ' url: ' + url);
        
        
        var jqXHR = $.getJSON(url)
        .error(function(jqHXR, textStatus) { 
          my.unregisterRequest(my.runningUpdatesPerId, id, updateType); 
          console.log ('ERROR: ' + textStatus); 
        })
        .success(function(data) { 
          var army = my.armies[id];

          if (army) {
            army.updateWith(data, updateType, start);
          }
          else {
            army = module.createArmy();
            army.init(data);
            my.armies[army.id()] = army;
            // if (army.owner_id() == player.id()) my.ownArmies[amry.id()] = army;
          }
          my.unregisterRequest(my.runningUpdatesPerId, id, updateType); 
          if (callback) {
            callback(army);
          }        
        }); 
      }
      else {          // update on this army is already running -> return false
        return false;
      }
      return true;    // update is underway
    };
   

    
    return that;
        
  }());
  


  return module;
  
}(AWE.GS || {}));

  AWE.GS.armyManager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(army) {
    console.log("RECEIVED AGGREGATE: " + army.toString());
    AWE.GS.armyManager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function(army) {
      console.log("RECEIVED SHORT: " + army.toString());
    });
    AWE.GS.armyManager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(army) {
      console.log("RECEIVED AGGREGATE 2: " + army.toString());
    });
  });
  

$(document).ready(function() {


  
});