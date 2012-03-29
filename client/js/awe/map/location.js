/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Map = (function(module) {
  
  module.terrainTypes = [ 'plain', 'forest', 'hill' ];
  module.locationTypes = [ 'empty', 'fortress', 'settlement', 'outpost'];


  /** represents one location within a map region. Locations can be entered by armies
   * and can be settled by players. Location slot 0 always represents the region's
   * fortress controlling all access from and to the region. The owner of location 0
   * is also considered the owner of the region. */
  module.createLocation = function(spec) {
    spec = spec || {};
    
    var _id = spec.id || 0;
      
    var _updated_at = spec.updated_at || null;
    var _created_at = spec.created_at || null;
    
    var _regionId = spec.region_id || 0;
    var _slot = spec.slot || 0;
    var _typeId = spec.type_id || 0;
    var _name = spec.name || 'Lagerplatz';
    var _ownerId = spec.owner_id || 0;
    var _ownerName = spec.owner_name || null;
    var _allianceId = spec.alliance_id || 0;
    var _allianceTag = spec.alliance_tag;
    
    var _level = spec.level || 0;
    
    var _region = null;
    
    var _armies = {};
    
    var that = {};
    AWE.Partials.addUpdateTracking(that);  // adds methods for update tracking.
    AWE.Partials.addChangeTracking(that);
    
    /** return the region's id */
    that.id = function() { return _id; }
    
    /** returns the timestamp of the last change in the database. Use with caution:
     * it's really only information about the database, it does not consider local 
     * changes or changes in 'sub-properties' like the region; use lastChange() 
     * instead! */
    that.updatedAt = function() { return _updated_at; }
    
    /** returns the regions name; */
    that.name = function() { return _name; }
    
    /** returns the region the location is associated with. */
    that.region = function() { return _region; }
    
    /** returns the slot of the location. Each regions has 9 or more slots. Slot 0 is
     * reserved for the fortress in the center of each region. */
    that.slot = function() { return _slot; }
    
    /** sets the region the loation is associated with. */
    that.setRegion = function(region) { _region = region; _regionId = region.id(); }

    /** returns the type of the settlement; */
    that.typeId = function() { return _typeId; }

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

    /** returns the level of the settlement / fortress / outpost (0 to 10). */
    that.level = function() { return _level; }
        
    that.getArmies = function() { return _armies };
    that.addArmy = function(army) { _armis[army.id()] = army; }
    that.removeArmy = function(army) {
      if (_armies[army.id()]) {
        delete _armies[army.id()] 
      }
    }
        
        
    /** this method updates the data stored at the local region from the given 
     * region. Does not change the association to a node. */ 
    that.updateLocationFrom = function(location) {

      if (location.id() != _id) {
        console.log('WARNING: updating data of location ' + _id + ' from a different location with id '+ location.id() + '.');
      }
        
      _id = location.id();
      
      _updated_at = location.updatedAt();
      _created_at = location.createdAt();
      
      _name = location.name() || _name;
      _slot = location.slot() || 0;
      _ownerId = location.ownerId() || 0;
      _ownerName = location.ownerName() || null;
      _allianceId = location.allianceId() || 0;
      _allianceTag = location.allianceTag() || null;
      _typeId = location.typeId() || 0;
      _level = location.level() || 0; 
      
      module.Manager.addLocation(this); // just to be sure it's under control of the manager   
      
      that.setChangedNow();  
    };
    
    /** Returns the position of the village on the map */
    that.position = AWE.memoizer(null, function () {
      var frame = that.region().node().frame();
      //for the fortress return the center
      if (_slot == 0) {
        AWE.Geometry.createPoint(
          frame.origin.x + frame.size.width/2,
          frame.origin.y + frame.size.height/2
        );
      //callculate village positon
      } else {
        //callculate base position
        var basePositon;
        var offDir;
        var streetEndPosition;
        if (_slot < 3) {
          //slot 1,2 top
          basePositon = {
            x: frame.origin.x + frame.size.width/2,
            y: frame.origin.y
          };
          offDir = {x: -1, y: 0};
          streetEndPosition = {
            x: basePositon.x + frame.size.width/4, 
            y: basePositon.y };
          basePositon.y += frame.size.height*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN;
        } else if (_slot < 5) {
          //slot 3,4 right
          basePositon = {
            x: frame.origin.x + frame.size.width,
            y: frame.origin.y + frame.size.height/2
          };
          offDir = {x: 0, y: -1};
          streetEndPosition = {
            x: basePositon.x, 
            y: basePositon.y + frame.size.height/4};
          basePositon.x -= frame.size.width*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN;
        } else if (_slot < 7) {
          //slot 5,6 bottom
          basePositon = {
            x: frame.origin.x + frame.size.width/2,
            y: frame.origin.y + frame.size.height
          };
          offDir = {x: 1, y: 0};
          streetEndPosition = {
            x: basePositon.x + frame.size.width/4, 
            y: basePositon.y};
          basePositon.y -= frame.size.height*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN;
        } else if (_slot < 9){
          //slot 7,8 left
          basePositon = {
            x: frame.origin.x,
            y: frame.origin.y + frame.size.height/2
          };
          offDir = {x: 0, y: 1};
          streetEndPosition = {
            x: basePositon.x, 
            y: basePositon.y + frame.size.height/4};
          basePositon.x += frame.size.width*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN; 
        } else {
          console.error("Can't callculate positon for slot that have a higher number than 8");
        }
        //callculate the offset dir
        var mod = _slot/2;
        if (Math.floor(mod) == mod) {
          offDir.x *= -1;
          offDir.y *= -1;
        }

        //callculate the length of the offset dir
        var v = {
          x: frame.origin.x + frame.size.width/2 - streetEndPosition.x,
          y: frame.origin.y + frame.size.height/2 - streetEndPosition.y
        };
        var alpha;
        if (offDir.x == 0) {
          alpha = (basePositon.x - streetEndPosition.x)/v.x;
        } else {
          alpha = (basePositon.y - streetEndPosition.y)/v.y;
        }
        streetEndPosition.x += v.x*alpha;
        streetEndPosition.y += v.y*alpha;
        offDir.x = offDir.x * (streetEndPosition.x - basePositon.x)/2;
        offDir.y = offDir.y * (streetEndPosition.y - basePositon.y)/2;

        return AWE.Geometry.createPoint(
          // basePositon.x + offDir.x,
          // basePositon.y + offDir.y
          basePositon.x + offDir.x,
          basePositon.y + offDir.y
        );
      } 
    });
    
    // further initialization
    
    module.Manager.addLocation(that); // just to be sure it's under control of the manager

    
    return that;  
    
  };
  
  return module;
    
}(AWE.Map || {}));



