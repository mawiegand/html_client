/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState base class, manager and helpers. */
AWE.GS = (function(module) {

  /** Base class of all classes that represent states & entities of the game. */
  module.initializeNewEntityType(
    'Army', 
    function(my) {     // Army.create    -> creates army objects
    
      // private attributes and methods ////////////////////////////////////////
    
      var that;
    
  
      // protected attributes and methods //////////////////////////////////////
  
      my = my || {};
      my.typeName = 'Army';

    
      // public attributes and methods /////////////////////////////////////////
    
      that = module.createEntity(my);
  
    
      // synthesized properties ////////////////////////////////////////////////

      that.property('name',         null, module.PROPERTY_READ_ONLY);

      that.property('location_id',  null, module.PROPERTY_READ_ONLY, module.PROPERTY_HASHABLE);
      that.property('region_id',    null, module.PROPERTY_READ_ONLY, module.PROPERTY_HASHABLE);

      that.property('owner_id',     null, module.PROPERTY_READ_ONLY);
      that.property('owner_name',   null, module.PROPERTY_READ_ONLY);
      that.property('alliance_id',  null, module.PROPERTY_READ_ONLY);
      that.property('alliance_tag', null, module.PROPERTY_READ_ONLY);

      that.property('ap_last', null, module.PROPERTY_READ_ONLY);
      that.property('ap_max', null, module.PROPERTY_READ_ONLY);
      that.property('ap_present', null, module.PROPERTY_READ_ONLY);
      that.property('ap_seconds_per_point', null, module.PROPERTY_READ_ONLY);
    
    
      that.property('exp', null, module.PROPERTY_READ_ONLY);
      that.property('rank', null, module.PROPERTY_READ_ONLY);

      that.property('stance', null, module.PROPERTY_READ_ONLY);
      that.property('strength', null, module.PROPERTY_READ_ONLY);
    
      that.property('home_settlement_id', null, module.PROPERTY_READ_ONLY);
      that.property('home_settlement_name', null, module.PROPERTY_READ_ONLY);
    
      that.property('size_max', null, module.PROPERTY_READ_ONLY);
      that.property('size_present', null, module.PROPERTY_READ_ONLY);

      that.property('mode', null, module.PROPERTY_READ_ONLY);        

      that.property('battle_id', 0, module.PROPERTY_READ_ONLY);
      that.property('battle_retreat', false, module.PROPERTY_READ_ONLY);

      that.property('target_location_id', null, module.PROPERTY_READ_ONLY);    
      that.property('target_reached_at', null, module.PROPERTY_READ_ONLY);    
      that.property('target_region_id', null, module.PROPERTY_READ_ONLY);    

      that.toString = function() {
        return "army " + this.id() + ", " + this.name() + " at " + this.region_id() + "/" + this.location_id();
      }

      return that;
    },
  
    (function(my) {    // Army.Manager    -> manager singleton
    
      // private attributes and methods ////////////////////////////////////////
    
      var that;
    
      var armiesPerLocation = {};
      var armiesPerRegion = {};     
      var armiesPerFortress = {};     
      var armiesPerOwner = {};
      var armiesPerAlliance = {}; 
  
      // protected attributes and methods //////////////////////////////////////
  
      my = my || {};
    
      my.runningUpdatesPerRegion = {};  ///< hash that contains all running requests for regions, using the region.id as key.
      my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
      
      my.createEntity = function() { return module.Army.create(); }

    
      // public attributes and methods /////////////////////////////////////////
    
      that = module.createEntityManager(my);
    
      that.getArmy = function(id) { return that.getEntity(id); }
      that.getArmiesInRegion = function(id) { 
        if (armiesPerRegion[id]) {
          return armiesPerRegion[id].armies;
        } 
        else {
          return [];
        }
      }
      that.getArmiesAtLocation = function(id) { 
        if (armiesPerLocation[id]) {
          return armiesPerLocation[id].armies;
        } 
        else {
          return [];
        }
      }
      that.getArmiesInRegion = function(id) { 
        if (armiesPerRegion[id]) {
          return armiesPerRegion[id].armies;
        } 
        else {
          return [];
        }
      }
    
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
        
    }())
  );

  return module;
  
}(AWE.GS || {}));

  AWE.GS.Army.Manager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(army) {
    console.log("RECEIVED AGGREGATE: " + army.toString());
    AWE.GS.Army.Manager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function(army) {
      console.log("RECEIVED SHORT: " + army.toString());
      AWE.GS.Army.Manager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function(army) { // second time should not fetch data because a not-modified header
        console.log("RECEIVED SHORT: " + army.toString());
        AWE.GS.Army.Manager.updateArmiesInRegion(army.region_id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(armies) {
          console.log("RECEIVED FULL FOR REGION: " + armies.toString());
          console.log("ARMIES IN REGION HASH: ");
          console.dir(AWE.GS.Army.getAllForRegion_id(army.region_id()));
        });
      });         
    });
    AWE.GS.Army.Manager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(army) {
      console.log("RECEIVED AGGREGATE 2: " + army.toString());
    });
  });
  
  AWE.GS.Army.Manager.updateArmiesAtLocation(1, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(armies) {
     console.log("RECEIVED FULL FOR LOCATION: " + armies.toString());
  }); 

  var region = AWE.Map.createRegion({ id: 10}); 

  AWE.GS.Army.Manager.updateArmiesInRegion(1, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(armies) {
     console.log("RECEIVED FULL FOR REGION: " + armies.toString());
  });

  console.dir(AWE.GS);

$(document).ready(function() {


  
});