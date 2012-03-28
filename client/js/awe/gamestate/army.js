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
    
    my.runningUpdatesPerRegion = {};  ///< hash that contains all running requests for regions, using the region.id as key.
    my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
      
    my.createEntity = function() { return module.createArmy(); }
    
    // public attributes and methods /////////////////////////////////////////
    
    that = module.createEntityManager(my);
    
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateArmy = function(id, updateType, callback) {
      var url = AWE.Config.MILITARY_SERVER_BASE+'armies/'+id+'.json';
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    /** updates all armies in a given region. Calls the callback with a
     * list of all the updated armies. */
    that.updateArmiesInRegion = function(regionId, updateType, callback) {
      var url = AWE.Config.MAP_SERVER_BASE+'regions/'+regionId+'/armies.json';
      return my.fetchEntitiesFromURL(url, my.runningUpdatesPerRegion, regionId, updateType, null, callback); 
    }
    
    that.updateArmiesAtLocation = function(locationId, updateType, callback) {
      var url = AWE.Config.MAP_SERVER_BASE+'locations/'+locationId+'/armies.json';
      return my.fetchEntitiesFromURL(url, my.runningUpdatesPerLocation, locationId, updateType, null, callback);       
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