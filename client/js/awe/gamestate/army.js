/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.ArmyAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   ARMY
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Army = module.Entity.extend({     // extends Entity to Army
    typeName: 'Army',
    name: null, 
    
    location_id: null, old_location_id: null,
    locationIdObserver: AWE.Partials.attributeHashObserver(module.ArmyAccess, 'location_id', 'old_location_id').observes('location_id'),
    
    location: function(){
      return AWE.Map.Manager.getLocation(this.get('location_id'));    
    }.property('location_id').cacheable(),    
    
    region_id: null, old_region_id: null,
    regionIdObserver: AWE.Partials.attributeHashObserver(module.ArmyAccess, 'region_id', 'old_region_id').observes('region_id'),

    owner_id: null,
    owner_name: null,
    alliance_id: null,
    alliance_tag: null,
    
    ap_next: null,
    ap_max: null,
    ap_present: null,
    ap_seconds_per_point: null,
    
    exp: null,
    rank: null,
    
    velocity: null,
    garrison: null,
    
    stance: null,
    strength: null,
    
    unitcategory_cavalry_strength: null,
    unitcategory_infantry_strength: null,
    unitcategory_artillery_strength: null,
    unitcategory_siege_strength: null,
    
    home_settlement_id: null,
    home_settlement_name: null,
    
    size_max: null,
    size_present: null,
    
    mode: null,
    kills: null,
    victories: null,
    
    battle_id: 0,
    battle_retreat: false,
    
    target_location_id: null,
    target_reached_at: null,
    target_region_id: null,
    
    details: null,
    
    isOwn: function() {
      return this.get('owner_id') === module.CharacterManager.currentCharacter.getId();
    },
    
    isGarrison: function() {
      return this.get('garrison');
    },  
    
    isMovable: function() {
      return ;
    },
    
    relation: function() {
      return module.Relation.relationTo(this.get('owner_id'), this.get('alliance_id'));
    },
    
    /** set the optional acceptUnkown flag to true, if your want to get a 
     * positive answer for unknown relation state. Just ignore it otherwise.*/
    isRelationAtLeast: function(relation, acceptUnknown) {
      return module.Relation.isRelationToAtLeast(this.get('owner_id'), this.get('alliance_id'), relation, acceptUnknown);
    },
  });     

    
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
    
    my.createEntity = function() { return module.Army.create(); }

  
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
    
  
  return module;
  
}(AWE.GS || {}));




