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
    
    var processArmyData = function(data, updateType, start) {
      var army = my.armies[data.id];

      if (army) {
        army.updateWith(data, updateType, start);
      }
      else {
        army = module.createArmy();
        army.init(data);
        my.armies[army.id()] = army;
        // if (army.owner_id() == player.id()) my.ownArmies[amry.id()] = army;
      }
      return army;
    };
    
    var fetchArmiesFromURL = function(url, queue, id, updateType, modifiedSince, callback) {
      if (updateType === undefined) { 
        updateType = module.ENTITY_UPDATE_TYPE_FULL;
      }
      
      if (my.tryRegisterRequest(queue, id, updateType)) {
        var start = new Date();
        
        var options = {
          url: (url+'?'+my.updateTypeQueryToken(updateType)),
          dataType: 'json',
        };
        if (modifiedSince) {
          options.headers = { 'If-Modified-Since': modifiedSince };
          console.log ('OPTIONS: ' + options);
        }
        var jqXHR = $.ajax(options)
        .error(function(jqHXR, textStatus) {          // On failure: 
          my.unregisterRequest(queue, id, updateType);//   unregister request 
          console.log ('ERROR FETCHING ARMIES FOR URL ' + url + ': ' + textStatus); 
        })
        .success(function(data) {                     // On success: 
          var result = null;
          if (data && data.length !== undefined) {    //   A) process an array of armies
            result = [];
            for (var i=0; i < data.length; i++) { 
              var armyData = data[i];
              result.push(processArmyData(armyData, updateType, start));
            }          
          }
          else {                                      //   B) process a single army
            result = processArmyData(data, updateType, start);
          }
          my.unregisterRequest(queue, id, updateType);//   unregister request 
          if (callback) {
            callback(result);
          }        
        }); 
      }
      else {          // update on this army is already running -> return false
        return false;
      }
      return true;    // update is underway           
    }
    
  
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
      var lastUpdateAt = null;
      if (updateType === undefined) { 
        updateType = module.ENTITY_UPDATE_TYPE_FULL;
      }
      var army = my.armies[id];
      if (army && army.lastUpdateAt(updateType)) {
        lastUpdateAt = army.lastUpdateAt(updateType);
      }
      var url = AWE.Config.MILITARY_SERVER_BASE+'armies/'+id+'.json';
      return fetchArmiesFromURL(url, my.runningUpdatesPerId, id, updateType, lastUpdateAt, callback); 
    };
    
    /** updates all armies in a given region. Calls the callback with a
     * list of all the updated armies. */
    that.updateArmiesInRegion = function(regionId, updateType, callback) {
      var url = AWE.Config.MAP_SERVER_BASE+'regions/'+regionId+'/armies.json';
      return fetchArmiesFromURL(url, my.runningUpdatesPerRegion, regionId, updateType, null, callback); 
    }
    
    that.updateArmiesAtLocation = function(locationId, updateType, callback) {
      var url = AWE.Config.MAP_SERVER_BASE+'locations/'+locationId+'/armies.json';
      return fetchArmiesFromURL(url, my.runningUpdatesPerLocation, locationId, updateType, null, callback);       
    }
      
    return that;
        
  }());

  return module;
  
}(AWE.GS || {}));

  AWE.GS.armyManager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(army) {
    console.log("RECEIVED AGGREGATE: " + army.toString());
    AWE.GS.armyManager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function(army) {
      console.log("RECEIVED SHORT: " + army.toString());
      AWE.GS.armyManager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function(army) { // second time should not fetch data because a not-modified header
        console.log("RECEIVED SHORT: " + army.toString());
        AWE.GS.armyManager.updateArmiesInRegion(army.region_id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(armies) {
          console.log("RECEIVED FULL FOR REGION: " + armies.toString());
        });
      });         
    });
    AWE.GS.armyManager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(army) {
      console.log("RECEIVED AGGREGATE 2: " + army.toString());
    });
  });
  
  AWE.GS.armyManager.updateArmiesAtLocation(1, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(armies) {
     console.log("RECEIVED FULL FOR LOCATION: " + armies.toString());
  }); 


  var region = AWE.Map.createRegion({ id: 10}); 

  AWE.GS.armyManager.updateArmiesInRegion(1, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(armies) {
     console.log("RECEIVED FULL FOR REGION: " + armies.toString());
  });

$(document).ready(function() {


  
});