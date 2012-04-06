/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState base class, manager and helpers. */
AWE.GS = (function(module) {
    
  module.ArmyAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   ARMY
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Army = module.Entity.extend({     // Army.create    -> creates army objects
    typeName: 'Army',
    
    toString: function() {
      return "army " + this.getId() + ", " + this.getName() + " at " + this.getRegion_id() + "/" + this.getLocation_id();
    }
  });  
  AWE.Partials.mixinProperties(module.Army, module.ArmyAccess);
  module.Army.addProperty('name',                 null);

  module.Army.addProperty('location_id',          null, module.PROPERTY_HASHABLE);
  module.Army.addProperty('region_id',            null, module.PROPERTY_HASHABLE);

  module.Army.addProperty('owner_id',             null);
  module.Army.addProperty('owner_name',           null);
  module.Army.addProperty('alliance_id',          null);
  module.Army.addProperty('alliance_tag',         null);

  module.Army.addProperty('ap_last',              null);
  module.Army.addProperty('ap_max',               null);
  module.Army.addProperty('ap_present',           null);
  module.Army.addProperty('ap_seconds_per_point', null);
        
  module.Army.addProperty('exp',                  null);
  module.Army.addProperty('rank',                 null);

  module.Army.addProperty('stance',               null);
  module.Army.addProperty('strength',             null);
    
  module.Army.addProperty('home_settlement_id',   null);
  module.Army.addProperty('home_settlement_name', null);
    
  module.Army.addProperty('size_max',             null);
  module.Army.addProperty('size_present',         null);

  module.Army.addProperty('mode',                 null);        

  module.Army.addProperty('battle_id',            0);
  module.Army.addProperty('battle_retreat',       false);

  module.Army.addProperty('target_location_id',   null);    
  module.Army.addProperty('target_reached_at',    null);    
  module.Army.addProperty('target_region_id',     null);    

    
    // ///////////////////////////////////////////////////////////////////////
    //
    //   ARMY MANAGER
    //
    // ///////////////////////////////////////////////////////////////////////  
  
    module.ArmyManager = (function(my) {    // Army.Manager    -> manager singleton
    
      // private attributes and methods //////////////////////////////////////
    
      var that;
      var lastFortressUpdates = {};
      
  
      // protected attributes and methods ////////////////////////////////////
  
      my = my || {};
    
      my.runningUpdatesPerRegion = {};  ///< hash that contains all running requests for regions, using the region.id as key.
      my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
      
      my.createEntity = function() { return module.Army.create(); }

    
      // public attributes and methods ///////////////////////////////////////
    
      that = module.createEntityManager(my);
    
      that.getArmy = function(id) { return that.getEntity(id); }
      that.getArmiesInRegion = function(id) { 
        return AWE.GS.ArmyAccess.getAllForRegion_id(id)
      }
      that.getArmiesAtLocation = function(id) { 
        return AWE.GS.ArmyAccess.getAllForLocation_id(id)
      }
      
      that.lastUpdateForFortress = function(regionId) {
        if (lastFortressUpdates[regionId]) {
          return lastFortressUpdates[regionId];
        }
        else {
          return new Date(1970);
        }
      }

    
      /** returns true, if update is executed, returns false, if request did 
       * fail (e.g. connection error) or is unnecessary (e.g. already underway).
       */
      that.updateArmy = function(id, updateType, callback) {
        var url = AWE.Config.MILITARY_SERVER_BASE+'armies/'+id;
        return my.updateEntity(url, id, updateType, callback); 
      };
    
      /** updates all armies in a given region. Calls the callback with a
       * list of all the updated armies. */
      that.updateArmiesInRegion = function(regionId, updateType, callback) {
        var url = AWE.Config.MAP_SERVER_BASE+'regions/'+regionId+'/armies';
        return my.fetchEntitiesFromURL(
          url,                                  // url to fetch from
          my.runningUpdatesPerRegion,           // queue to register this request during execution
          regionId,                             // regionId to fetch -> is used to register the request
          updateType,                           // type of update (aggregate, short, full)
          module.ArmyAccess.lastUpdateForRegion_id(regionId), // modified after
          function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
            if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
              module.ArmyAccess.accessHashForRegion_id().setLastUpdateAtForValue(regionId, timestamp);
            }
            if (callback) {
              if (status === AWE.Net.NOT_MODIFIED) {
                result = module.ArmyAccess.getAllForRegion_id(regionId);
              }
              callback(result, status, xhr, timestamp);
            }
          }
        ); 
      }
    
      that.updateArmiesAtLocation = function(locationId, updateType, callback) {
        var url = AWE.Config.MAP_SERVER_BASE+'locations/'+locationId+'/armies';
        return my.fetchEntitiesFromURL(
          url, 
          my.runningUpdatesPerLocation, 
          locationId, 
          updateType, 
          module.ArmyAccess.lastUpdateForLocation_id(locationId),
          function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
            if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
              module.ArmyAccess.accessHashForLocation_id().setLastUpdateAtForValue(locationId, timestamp);
            }
            if (callback) {
              if (status === AWE.Net.NOT_MODIFIED) {
                result = module.ArmyAccess.getAllForLocation_id(locationId);
              }
              callback(result, status, xhr, timestamp);
            }
          }
        );
      }
      
      that.updateArmiesAtFortress = function(regionId, updateType, callback) {
        var url = AWE.Config.MAP_SERVER_BASE+'regions/'+regionId+'/armies?fortress_only=1';
        return my.fetchEntitiesFromURL(
          url, 
          my.runningUpdatesPerRegion, 
          regionId, 
          updateType, 
          this.lastUpdateForFortress(regionId),
          function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
            if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
              lastFortressUpdates[regionId] = timestamp;
            }
            if (callback) {
              if (status === AWE.Net.NOT_MODIFIED) {
                result = module.ArmyAccess.getAllForRegion_id(regionId);
              }
              callback(result, status, xhr, timestamp);
            }
          }
        );        
      }
      
      
      return that;
        
    }());
    
  var army = module.Army.create().init({id:0}); // create one instance to create hashes
  console.log(army);
  console.log(AWE.GS);
  
  return module;
  
}(AWE.GS || {}));


/*
$(document).ready(function() {
  
  var army = AWE.GS.Army.create();
  console.dir(AWE.GS);
  
  AWE.Net.init();

  AWE.GS.Army.Manager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_AGGREGATE, function(army) {
    console.log("RECEIVED AGGREGATE: " + army.toString());
    AWE.GS.Army.Manager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function(army) {
      console.log("RECEIVED SHORT: " + army.toString());
      AWE.GS.Army.Manager.updateArmy(10, AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function(army) { // second time should not fetch data because a not-modified header
        console.log("RECEIVED SHORT: " + army.toString());
        AWE.GS.Army.Manager.updateArmiesInRegion(army.region_id(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(armies) {
          console.log("RECEIVED FULL FOR REGION: " + armies.toString());
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
    AWE.GS.Army.Manager.updateArmiesInRegion(1, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(armies) {
      console.log("RECEIVED FULL FOR REGION SECOND CALL: " + armies.toString());
    });
  });


});
*/


