/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Map = (function(module) {

  /** every leaf-node is associated with a region object. Each Region represents one
   * field on the map, the user may enter, own or settle in. The region has several
   * locations within it's borders, where location slot 0 is the fortress and the
   * other locations are spots for moving and settling. Furthermore, the region
   * offers a few properties with aggregate information, like the number
   * of settlements in its borders and its owner (copy of owner of location slot 0).
   */
  module.createRegion = function(spec) {
    spec = spec || {};    // default value for spec: empty spec
 
    var _id = spec.id || 0;
          
    var _updated_at = spec.updated_at || null;
    var _created_at = spec.created_at || null;
    
    var _nodeId = spec.node_id || 0;
    var _name = spec.name || 'Ödland';
    var _ownerId = spec.owner_id || 0;
    var _ownerName = spec.owner_name || null;
    var _allianceId = spec.alliance_id || 0;
    var _allianceTag = spec.alliance_tag;
    var _countOutposts = spec.count_outposts || 0;
    var _countSettlements = spec.count_settlements || 0;
    var _terrain_id = spec.terrain_id || 0;
    
    var _fortress_level = spec.fortress_level || 0;
    var _fortress_id = spec.fortress_id || 0;
    
    var _node = null;
    
    var _locations = null;
        
    var that = {};
    AWE.Partials.addUpdateTracking(that);  // adds methods for update tracking.
    AWE.Partials.addChangeTracking(that);
    
    // TODO: watch change of locations!
    
    /** return the region's id */
    that.id = function() { return _id; }
    
    /** returns the timestamp of the last change in the database. Use with caution:
     * it's really only information about the database, it does not consider local 
     * changes or changes in 'sub-properties' like the region; use lastChange() 
     * instead! */
    that.updatedAt = function() { return _updated_at; }

    that.createdAt = function() { return _created_at; }

    
    /** returns the regions name; */
    that.name = function() { return _name; }
    
    /** returns the node the region is associated with. */
    that.node = function() { return _node; }
    
    /** sets the node the region is associated with. */
    that.setNode = function(node) { _node = node; _nodeId = node.id(); }
    
    /** returns the name of the character owning the region (fortress). */
    that.ownerName = function() { return _ownerName; }
    
    /** returns the id of the character owning the region (fortress). 0 for
     * neutral fortress (not owned by any character, NPC-owned). */
    that.ownerId = function() { return _ownerId; }

    /** returns the tag of the alliance owning the region (owner of fortress). */
    that.allianceTag = function() { return _allianceTag; }
    
    /** returns the id of the alliance owning the region (owner of fortress). 0 for 
     * no alliance. */
    that.allianceId = function() { return _allianceId; }

    /** returns the level of the fortress (0 to 10). */
    that.fortressLevel = function() { return _fortress_level; }
    
    /** returns the location id of the fortress. */
    that.fortressLocationId = function() { return _fortress_id; }
    
    /** returns the type of the terrain of that region. Later terrain types should
     * be defined in the game rules. */
    that.terrainId = function() { return _terrain_id; }
    
    /** returns an array of all locations within the region, or null, if this data
     * hasn't been fetched, yet. */
    that.locations = function() { return _locations; }
    
    /** returns the location for the given slot */
    that.location = function(slot) { return _locations === null ? null : _locations[slot]; }
    
    /** sets the locations to the given array of locations */
    that.setLocations = function(locations) {
      if (_locations != locations) {
        that.setChangedNow();  // need to set change manually, as the locations property has changed by this assignement    
      }            
      _locations = locations;
    };
    
    that.countSettlements = function() {
      return _countSettlements;
    }
    
    that.countOutposts = function() {
      return _countOutposts;
    }
    
    that.getArmies = function() { 
      return AWE.GS.Army.getAllForRegion_id(_id) 
    };
    
    that.getArmiesAtFortress = function() {
      return AWE.GS.Army.getAllForLocation_id(this.fortressLocationId);
    }
    
    that.lastArmyUpdateAt = function() {
      return AWE.GS.Army.lastUpdateForRegion_id(_id);
    }
    
    that.updateArmies = function(updateType, callback) {
      AWE.GS.Army.Manager.updateArmiesInRegion(_id, updateType, callback)
    }
    
    /** this method updates the data stored at the local region from the given 
     * region. Does not change the association to a node. */ 
    that.updateRegionFrom = function(region) {

      if (region.id() != _id) {
        console.log('ERROR: updating data of region ' + _id + ' from a different region with id '+ region.id() + '.');
      }
        
      _id = region.id();
      
      _updated_at = region.updatedAt();
      _created_at = region.createdAt();
      
      _name = region.name() || _name;
      _ownerId = region.ownerId() || 0;
      _ownerName = region.ownerName() || null;
      _allianceId = region.allianceId() || 0;
      _allianceTag = region.allianceTag() || null;
      _countOutposts = region.countOutposts() || 0;
      _countSettlements = region.countSettlements() || 0;
      _terrain_id = region.terrainId() || 0;
      _fortress_level = region.fortressLevel() || 0;    
      _fortress_id = region.fortressLocationId() || 0;    
      
      module.Manager.addRegion(this); // just to be sure it's under control of the manager
      
      that.setChangedNow();  
    };
    
    that.toString = function (traverse) {
      var string = " Region with id: " + _id + " name: " + name + " for node: qt" + _node.path() + ".";
      return string;
    }
    
    // Further initialization
    
    module.Manager.addRegion(that); 

    
    return that;      
  };
  
  return module;
    
}(AWE.Map || {}));



