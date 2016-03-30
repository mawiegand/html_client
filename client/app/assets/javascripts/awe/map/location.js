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
      
    var _updated_at = spec.updated_at || null;
    var _created_at = spec.created_at || null;
    
    var _regionId = spec.region_id || 0;
    var _slot = spec.slot || 0;
    var _settlementTypeId = spec.settlement_type_id || 0;
    var _settlementLevel = spec.settlement_level || 0;
    var _settlementScore = spec.settlement_score || 0;
    var _name = spec.name || 'Lagerplatz';
    var _ownerId = spec.owner_id || 0;
    var _ownerName = spec.owner_name || null;
    var _allianceId = spec.alliance_id || 0;
    var _allianceTag = spec.alliance_tag;
    var _allianceColor = spec.alliance_color;
    var _rightOfWay = spec.right_of_way;
    var _imageId = spec.image_id;

    
    
    var _region = null;
        
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
    that.createdAt = function() { return _created_at; }
    
    that.updatedOnServerAt = function() {
      return _updated_at ? Date.parseISODate(_updated_at) : null;
    };
    
    /** returns the regions name; */
    that.name = function() {
      var settlementType = AWE.GS.RulesManager.getRules().getSettlementType(_settlementTypeId || 0);
      if (settlementType != null) {
        return AWE.Util.Rules.lookupTranslation(settlementType.name);
      }
      else {
        return "Siedlung";
      }
    }
    
    /** returns the region the location is associated with. */
    that.region = function() { return _region; }
    
    /** returns the node the location is associated with over the region. */
    that.node = function() { return _region.node(); }
    
    /** returns the slot of the location. Each regions has 9 or more slots. Slot 0 is
     * reserved for the fortress in the center of each region. */
    that.slot = function() { return _slot; }
    
    /** sets the region the loation is associated with. */
    that.setRegion = function(region) { _region = region; _regionId = region.id(); }

    /** returns the type of the settlement; */
    that.settlementTypeId = function() { return _settlementTypeId; }

    /** returns the name of the character owning the region (fortress). */
    that.ownerName = function() { 
      var character = _ownerId  ? AWE.GS.CharacterManager.getCharacter(_ownerId) : null;
      if (character && character.updatedOnServerAt() > this.updatedOnServerAt()) {   
        return character.get('name');
      }
      else {   // only use mirrored information if character not available
        return _ownerName;
      }      
    }
    
    /** returns the id of the character owning the region (fortress). 0 for
     * neutral fortress (not owned by any character, NPC-owned). */
    that.ownerId = function() { return _ownerId; }

    /** returns the tag of the alliance owning the region (owner of fortress). */
    that.allianceTag = function() { 
      var character = _ownerId    ? AWE.GS.CharacterManager.getCharacter(_ownerId) : null;
      if (character && character.updatedOnServerAt() > this.updatedOnServerAt()) {   
        return character.get('alliance_tag');
      }
      else {   // only use mirrored information if character not available
        return _allianceTag;
      }
    }
    
    /** returns the id of the alliance owning the region (owner of fortress). 0 for 
     * no alliance. */
    that.allianceId = function() { return _allianceId; }

    that.allianceColor = function() {
      var character = _ownerId    ? AWE.GS.CharacterManager.getCharacter(_ownerId) : null;
      if (character && character.updatedOnServerAt() > this.updatedOnServerAt()) {
        return character.get('alliance_color');
      }
      else {   // only use mirrored information if character not available
        return _allianceColor;
      }
    }

    that.imageId = function() { return _imageId; }

    that.divineSupporterImage = function() {
      return false;
      // disable divine supporter due to new image sets
      // return _imageId === 1;
    }

    /** returns the right of way of the location. */
    that.rightOfWay = function() { return _rightOfWay; }

    /** returns the level of the settlement / fortress / outpost (0 to 10). */
    var _oldSettlementLevel = _settlementLevel;
    that.settlementLevel = function() { return _settlementLevel; }
    that.oldSettlementLevel = function() { return _oldSettlementLevel; }
    that.resetOldSettlementLevel = function() { return _oldSettlementLevel = null; }
    
    that.lastAnimationAt = null;


    that.settlementScore = function() { return _settlementScore; }

        
    that.getArmies = function() { 
      return AWE.GS.ArmyAccess.getAllForLocation_id(_id);
    };
    
    that.settlement = function(callback) {
      return AWE.GS.SettlementManager.getSettlementAtLocation(_id, callback);
    };
    
    that.garrisonArmy = function() { 
      var armies = AWE.GS.ArmyAccess.getAllForLocation_id(_id);
      
      var garrisonArmy = null;
      
      AWE.Ext.applyFunctionToElements(armies, function(army) {
        if (army.isGarrison()) {
          garrisonArmy = army;
        }        
      });
      
      return garrisonArmy;
    };
    
    that.settleable = function() {
      return _settlementTypeId !== undefined && _settlementTypeId === 0;
    }
    
    that.canFoundSettlementHere = function(character) {
      var locations = _region ? _region.locations() : null;
      if (_slot === 0 || !this.settleable() || !locations) {
        return false;          // fortress slot, settlement present or not enough data to decide
      }
      var numOwnSettlements = 0;
      var characterId = character.get('id');
      for (var i=1; i < locations.length; i++) {
        if (locations[i].ownerId() === characterId) {
          numOwnSettlements += 1;
        }
      }
      return numOwnSettlements === 0;
    }
    
    that.lastArmyUpdateAt = function() {
      return AWE.GS.ArmyAccess.lastUpdateForLocation_id(_id);
    }
    
    that.udpateArmies = function(updateType, callback) {
      AWE.GS.ArmyManager.updateArmiesInLocation(_id, updateType, callback);
    }
    
    that.region = function() {
      return _region;
    }
        
    that.isOwn = function() {
      return _ownerId === AWE.GS.CharacterManager.getCurrentCharacter().id;
    }
            
    that.isFortress = function() {
      return _slot == 0;
    }
            
    that.isEmpty = function() {
      return _settlementTypeId === AWE.GS.SETTLEMENT_TYPE_EMPTY;
    }
            
    /** this method updates the data stored at the local region from the given 
     * region. Does not change the association to a node. */ 
    that.updateLocationFrom = function(location) {

      if (location.id() != _id) {
        log('WARNING: updating data of location ' + _id + ' from a different location with id '+ location.id() + '.');
      }
        
      _id = location.id();
      
      _updated_at = location.updatedAt();
      _created_at = location.createdAt();
      
      _name = location.name() || _name;
      _slot = location.slot() || 0;
      _ownerId = location.ownerId() || 0;
      _ownerName = location.ownerName() || null;
      _allianceId = location.allianceId() || 0;
      _allianceTag = location.allianceTag() || null;
      _allianceColor = location.allianceColor() || null;
      _settlementTypeId = location.settlementTypeId() || 0;
      
      if ((location.settlementLevel() || 0) !== _settlementLevel) {
        _oldSettlementLevel = _settlementLevel;
        _settlementLevel    = location.settlementLevel() || 0; 
      }
      _settlementScore      = location.settlementScore() || 0; 
            
      module.Manager.addLocation(this); // just to be sure it's under control of the manager   
      
      that.setChangedNow();  
    };
    
    
    /** Returns the position of the village on the map */
    that.position = AWE.memoizer(undefined, function () {
      
      var frame = that.region().node().frame();

      //for the fortress return the center
      if (_slot == 0) {
        return AWE.Geometry.createPoint(
          frame.origin.x + frame.size.width/2,
          frame.origin.y + frame.size.height/2
        );
      //callculate village positon
      }
      else {
        //callculate base position
        var basePositon;
        var offDir;
        var streetEndPosition;
        if (_slot === 1) {
          //slot 1 top
          basePositon = {
            x: frame.origin.x + frame.size.width/2.05,
            y: frame.origin.y + frame.size.width/100
          };
          offDir = {x: -1.6, y: -6};
          streetEndPosition = {
            x: basePositon.x + frame.size.width/4, 
            y: basePositon.y
          };
          basePositon.y += frame.size.height*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN;
        }
        else if (_slot === 2) {
          //slot 2 top
          basePositon = {
            x: frame.origin.x + frame.size.width/2,
            y: frame.origin.y + frame.size.width/100
          };
          offDir = {x: 1.6, y: 0};
          streetEndPosition = {
            x: basePositon.x + frame.size.width/4, 
            y: basePositon.y 
          };
          basePositon.y += frame.size.height*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN;
        }
        else if (_slot === 3) {
          //slot 3 right
          basePositon = {
            x: frame.origin.x + frame.size.width*1.02,
            y: frame.origin.y + frame.size.height/1.95
          };
          offDir = {x: 0, y: -1.2};
          streetEndPosition = {
            x: basePositon.x, 
            y: basePositon.y + frame.size.height/4
          };
          basePositon.x -= frame.size.width*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN;
        }
        else if (_slot === 4) {
          //slot 4 right
          basePositon = {
            x: frame.origin.x + frame.size.width*1.02,
            y: frame.origin.y + frame.size.height/1.9
          };
          offDir = {x: 0, y: 1.2};
          streetEndPosition = {
            x: basePositon.x, 
            y: basePositon.y + frame.size.height/4
          };
          basePositon.x -= frame.size.width*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN;
        }
        else if (_slot === 5) {
          //slot 5 bottom
          basePositon = {
            x: frame.origin.x + frame.size.width/2,
            y: frame.origin.y + frame.size.height/0.95
          };
          offDir = {x: 1.6, y: 0};
          streetEndPosition = {
            x: basePositon.x + frame.size.width/4, 
            y: basePositon.y
          };
          basePositon.y -= frame.size.height*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN;
        }
        else if (_slot === 6) {
          //slot 6 bottom
          basePositon = {
            x: frame.origin.x + frame.size.width/2,
            y: frame.origin.y + frame.size.height/0.95
          };
          offDir = {x: -1.6, y: 0};
          streetEndPosition = {
            x: basePositon.x + frame.size.width/4, 
            y: basePositon.y
          };
          basePositon.y -= frame.size.height*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN;
        }
        else if (_slot === 7){
          //slot 7 left
          basePositon = {
            x: frame.origin.x,
            y: frame.origin.y + frame.size.height/2.05
          };
          offDir = {x: 0, y: 1.6};
          streetEndPosition = {
            x: basePositon.x, 
            y: basePositon.y + frame.size.height/4
          };
          basePositon.x += frame.size.width*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN; 
        }
        else if (_slot === 8){
          //slot 8 left
          basePositon = {
            x: frame.origin.x,
            y: frame.origin.y + frame.size.height/2.05
          };
          offDir = {x: 0, y: -1};
          streetEndPosition = {
            x: basePositon.x, 
            y: basePositon.y + frame.size.height/4
          };
          basePositon.x += frame.size.width*AWE.Config.MAP_LOCATION_SPOT_BORDER_MARGIN; 
        }
        else {
          console.error("Can't callculate positon for slot that have a higher number than 8");
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
    
}(AWE.Map || {}));



