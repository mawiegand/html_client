/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Settlement class, manager and helpers. */
AWE.GS = (function(module) {
    
  module.SettlementAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Settlement = module.Entity.extend({     // extends Entity to Settlement
    typeName: 'Settlement',
    name: null, 
    
    alliance_id: null, old_alliance_id: null, ///< id of the alliance the setllment is a member of
    allianceIdObserver: AWE.Partials.attributeHashObserver(module.SettlementAccess, 'alliance_id', 'old_alliance_id').observes('alliance_id'),
    
    armies_count: null,
    besieged: null,
    command_points: null,
    defense_bonus: null,
    founded_at: null,
    founder_id: null,
    garrison_id: null,
    level: null,
    location_id: null,
    morale: null,
    node_id: null,

    owner_id: null, old_owner_id: null,
    ownerIdObserver: AWE.Partials.attributeHashObserver(module.SettlementAccess, 'owner_id', 'old_owner_id').observes('owner_id'),    
    
    owns_region: null,
    points: null,
    region_id: null,
    tax_rate: null,
    taxable: null,
    type_id: null,
    
    isOwn: function() {
      return this.get('owner_id') === module.CharacterManager.currentCharacter.getId();
    },
    
    garrison: function() {
      return module.ArmyManager.getArmy(this.get('garrison_id'));
    },  
    
    owner: function() {
      return module.CharacterManager.getCharacter(this.get('owner_id'));
    },  
    
    founder: function() {
      return module.CharacterManager.getCharacter(this.get('founder_id'));
    },  
    
    slots: function() {
      return module.SlotManager.getSlotsAtSettlement(this.getId());
    },
        
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.SettlementManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastSettlementUpdates = {};
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerCharacter = {};
  
    // my.runningUpdatesPerRegion = {};  ///< hash that contains all running requests for regions, using the region.id as key.
    // my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
    
    my.createEntity = function() { return module.Settlement.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getSettlement = function(id) {
      return that.getEntity(id);
    }
        
    that.getOwnSettlements = function() {
      return AWE.GS.SettlementAccess.getAllForOwner_id(AWE.GS.CharacterManager.getCurrentCharacter().getId());
    }
    
    that.lastUpdateForCharacter = function(characterId) {
      if (lastSettlementUpdates[characterId]) {
        return lastSettlementUpdates[characterId];
      }
      else {
        return new Date(1970);
      }
    }
        
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateSettlement = function(id, updateType, callback) {
      var url = AWE.Config.SETTLEMENT_SERVER_BASE + 'settlements/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    /** updates all settlements for the current character. Calls the callback with a
     * list of all the updated settlements. */
    that.updateOwnSettlements = function(updateType, callback) {
      var characterId = AWE.GS.CharacterManager.getCurrentCharacter().getId();
      that.updateSettlementsOfCharacter(characterId, updateType, callback);
    }

    /** updates all settlements for a given character. Calls the callback with a
     * list of all the updated settlements. */
    that.updateSettlementsOfCharacter = function(characterId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/' + characterId + '/settlements';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerCharacter,                     // queue to register this request during execution
        characterId,                                       // regionId to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForCharacter(characterId),                              // modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            lastSettlementUpdates[characterId] = timestamp;
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = that.getEntities();
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