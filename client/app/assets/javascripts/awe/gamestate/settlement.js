/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  module.SETTLEMENT_TYPE_EMPTY = 0;
  module.SETTLEMENT_TYPE_FORTRESS = 1;
  module.SETTLEMENT_TYPE_BASE = 2;
  module.SETTLEMENT_TYPE_OUTPOST = 3;
    
  module.SettlementAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT
  //
  // ///////////////////////////////////////////////////////////////////////    
   
  /** 
   * Class for holding the state of a settlement. 
   *
   * @class
   * @extends AWE.GS.Entity
   * @name AWE.GS.Settlement */ 
  module.Settlement = module.Entity.extend( /** @lends AWE.GS.Settlement# */ {    
    typeName: 'Settlement',
    name: 'Settlement', 

    owner_id: null, old_owner_id: null,
    ownerIdObserver: AWE.Partials.attributeHashObserver(module.SettlementAccess, 'owner_id', 'old_owner_id').observes('owner_id'),    
    
    alliance_id: null, old_alliance_id: null, ///< id of the alliance the setllment is a member of
    allianceIdObserver: AWE.Partials.attributeHashObserver(module.SettlementAccess, 'alliance_id', 'old_alliance_id').observes('alliance_id'),

    location_id: null, old_location_id: null,
    locationIdObserver: AWE.Partials.attributeHashObserver(module.SettlementAccess, 'location_id', 'old_location_id').observes('location_id'),
    
    location: function(){
      return AWE.Map.Manager.getLocation(this.get('location_id'));    
    }.property('location_id').cacheable(),

    artifact: function() {
      if (this.get('isBase') && AWE.GS.game.get('currentArtifact')) {
        return AWE.GS.game.get('currentArtifact');
      }
      else {
        return null;
      }
    }.property('type_id', 'AWE.GS.game.currentArtifact').cacheable(),

    armies_count: null,
    besieged: null,
    command_points: null,
    defense_bonus: null,
    founded_at: null,
    founder_id: null,
    garrison_id: null,
    level: null,
    

    morale: null,
    node_id: null,

    owns_region: null,
    points: null,
    region_id: null,
    tax_rate: null,
    taxable: null,
    type_id: null,
    
    hashableQueues: null,
    hashableTrainingQueues: null,
    hashableResearchQueues: null,
    hashableIncomingCarts: null,
    hashableOutgoingCarts: null,
    
    hashableSlots: null,
        
    init: function(spec) {
      log('INIT settlement');
      this._super(spec);
      
      if (this.get('id')) {
        var hashableTrainingQueues = AWE.GS.TrainingQueueAccess.getHashableCollectionForSettlement_id(this.get('id'));
        var hashableQueues         = AWE.GS.ConstructionQueueAccess.getHashableCollectionForSettlement_id(this.get('id'));
        var hashableSlots          = AWE.GS.SlotAccess.getHashableCollectionForSettlement_id(this.get('id'));
        
        var hashableIncomingCarts  = AWE.GS.TradingCartActionAccess.getHashableCollectionForTarget_settlement_id(this.get('id'));
        var hashableOutgoingCarts  = AWE.GS.TradingCartActionAccess.getHashableCollectionForStarting_settlement_id(this.get('id'));

        this.set('hashableTrainingQueues', hashableTrainingQueues);
        this.set('hashableQueues',         hashableQueues);
        this.set('hashableSlots',          hashableSlots);
        this.set('hashableIncomingCarts',  hashableIncomingCarts);
        this.set('hashableOutgoingCarts',  hashableOutgoingCarts);
        
        log('SETTLEMENT WITH ID', this.get('id'), 'CARTS REQ', hashableIncomingCarts, hashableOutgoingCarts)
        
      }
    },
    
    region: null,
    regionIdObserver: function() {
      var regionId = this.get('region_id');
      var self = this;
      if (regionId) {
        var region = AWE.Map.Manager.getRegion(regionId);
        this.set('region', region);
        if (!region) {
          AWE.Map.Manager.fetchSingleRegionById(regionId, function(region) {
            self.set('region', region);
          });
        }
      }
    }.observes('region_id'),
    
    isOwn: function() {
      return this.get('owner_id') === module.CharacterManager.currentCharacter.getId();
    },
    
    isOutpost: function() {
      return this.get('type_id') === module.SETTLEMENT_TYPE_OUTPOST;
    }.property('type_id').cacheable(),
	
    isFortress: function() {
      return this.get('type_id') === module.SETTLEMENT_TYPE_FORTRESS;
    }.property('type_id').cacheable(),
    
    isBase: function() {
      return this.get('type_id') === module.SETTLEMENT_TYPE_BASE;
    }.property('type_id').cacheable(),
    
    regionInvitationCode: function() {
      var region = this.get('region');
      return region ? region.invitationCode() : null;
    }.property('region').cacheable(),
    
    garrison: function() {
      return module.ArmyManager.getArmy(this.get('garrison_id'));
    }.property('garrison_id').cacheable(),  
    
    owner: function() {
      return module.CharacterManager.getCharacter(this.get('owner_id'));
    },  
    
    ownerName: function() {
      var owner = this.owner();
      return owner ? owner.get('name') : this.get('owner_name');
    },
    
    alliance: function() {
      return module.AllianceManager.getCharacter(this.get('alliance_id'));
    },
    
    allianceTag: function() {
      var owner = this.owner();
      var alliance = this.alliance();
      return owner ? owner.get('alliance_tag') : (alliance ? alliance.get('tag') : this.get('alliance_tag'));
    },
    
    founder: function() {
      return module.CharacterManager.getCharacter(this.get('founder_id'));
    },  
    
    slots: function() {
      return module.SlotManager.getSlotsAtSettlement(this.getId());
    },

    queues: function() {
      return module.ConstructionQueueManager.getQueuesOfSettlement(this.getId());
    },

    trainingQueues: function() {
      return module.TrainingQueueManager.getQueuesOfSettlement(this.getId());
    },

    enumerableSlots: function() {
      return this.getPath('hashableSlots.collection');
    }.property('id', 'hashableSlots.changedAt').cacheable(),
    

    enumerableIncomingTradingCartActions: function() {
      log('SET INCOMING CARTS', this.getPath('hashableIncomingCarts.collection'));
      return this.getPath('hashableIncomingCarts.collection');
    }.property('id', 'hashableIncomingCarts.changedAt').cacheable(),

    enumerableOutgoingTradingCartActions: function() {
      log('SET OUTGOING CARTS', this.getPath('hashableOutgoingCarts'), this.getPath('hashableOutgoingCarts.collection'));
      return this.getPath('hashableOutgoingCarts.collection');
    }.property('id', 'hashableOutgoingCarts.changedAt').cacheable(),

    typeIsDestroyable: function() {
      var settlementType = this.settlementType();
      if (!settlementType) {
        return false;
      }
      return settlementType.destroyable && 0; // FIXME  presently destroying is not implemented
    }.property('type_id'),    

    typeIsConquerable: function() {
      var settlementType = this.settlementType();
      if (!settlementType) {
        return false;
      }
      return settlementType.conquerable; 
    }.property('type_id'),
    
    canBeTakenOver: function() {
      var preventedByBuilding = (this.get('settlement_unlock_prevent_takeover_count') || 0) >= 1;
      var settlementType = this.settlementType();
      if (!settlementType) {
        return false;
      }
      return settlementType.conquerable && !preventedByBuilding;
    }.property('type_id', 'settlement_unlock_prevent_takeover_count'),
    
    canBeDestroyed: function() {
      var preventedByBuilding = (this.get('settlement_unlock_prevent_takeover_count') || 0) >= 1;
      var settlementType = this.settlementType();
      if (!settlementType) {
        return false;
      }
      return settlementType.destroyable && !preventedByBuilding && 0; // FIXME  presently destroying is not implemented
    }.property('type_id', 'settlement_unlock_prevent_takeover_count'),    
    
    commandPointsUsed: function() {
      return this.get('armies_count') - 1;
    }.property('armies_count').cacheable(),
    
    settlementType: function() {
      return AWE.GS.RulesManager.getRules().getSettlementType(this.get('type_id'));
    },
    
    type: function() {
      return AWE.GS.RulesManager.getRules().getSettlementType(this.get('type_id'));
    }.property('type_id').cacheable(),

    taxPercentage: function() {
      return Math.floor(parseFloat(this.get('tax_rate') || "0.0") * 100.0 + 0.5);
    }.property('tax_rate').cacheable(),
    
    availableTradingCarts: function() {
      var carts = this.get('trading_carts') || 0;
      var used  = this.get('trading_carts_used') || 0;
      return Math.max(0, carts-used);
    }.property('trading_carts', 'trading_carts_used'),
    
    resourceProductions: function() {
      var self = this;
  		var productions = [];
  		var settlement = this.get('settlement');
  	  AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {  	    
  	    productions.push(Ember.Object.create({  // need to return an ember project so bindings on resourceType.name do work inside local helper
          rate:  AWE.Util.Rules.roundProductionRate(self.get(item.symbolic_id+'_production_rate')),
          base:  self.get(item.symbolic_id+'_base_production'),
          bonus: self.get(item.symbolic_id+'_production_bonus'),
          bonusAbs: parseFloat(self.get(item.symbolic_id+'_production_bonus') || "0.0") * parseFloat(self.get(item.symbolic_id+'_base_production')),
          tax: self.get(item.symbolic_id+'_production_tax_rate'),
          resourceType: item,
          localizedDetails: function() {
            var description = AWE.I18n.lookupTranslation('resource.productionTooltip.base')+': '+Math.floor(this.get('base'))+'\n'+AWE.I18n.lookupTranslation('resource.productionTooltip.science')+': '+ 
              Math.floor(self.get(item.symbolic_id+'_production_bonus_sciences')*1000)/10.0+'%\n'+AWE.I18n.lookupTranslation('resource.productionTooltip.buildings')+': '+ 
              Math.floor(self.get(item.symbolic_id+'_production_bonus_buildings')*1000)/10.0+'%\n'+AWE.I18n.lookupTranslation('resource.productionTooltip.bonus')+': ' +
              Math.floor((parseFloat(self.get(item.symbolic_id+'_production_bonus_effects')) + 
                          parseFloat(self.get(item.symbolic_id+'_production_bonus_global_effects')))*1000)/10.0+'%';
            if (item.taxable) {
              description += '\n'+AWE.I18n.lookupTranslation('resource.productionTooltip.tax')+': ' + Math.floor(parseFloat(self.get(item.symbolic_id+'_production_tax_rate'))*10)/10.0;   
            }
            return description;
          }.property('base','bonus').cacheable(),
        }));
      });
      return productions;
    }.property('updated_at'),
    
    usedBuildingSlots: function() {
      var enumerableSlots = this.get('enumerableSlots');
      if (!enumerableSlots || enumerableSlots.length === 0) {
        return null;
      }
      var numSlots = enumerableSlots.filter(function(item) {
        return item.building_id !== undefined && item.building_id !== null 
      }).length
      return numSlots;
    }.property('enumerableSlots.@each.building_id').cacheable(),
    
    availableBuildingSlots: function() {
      var total = 1; // every settlement has at least one slot
      var used  = this.get('usedBuildingSlots') || 1;
      
      if (AWE.Config.SETTLEMENT_DYNAMIC_SLOTS) {
        total = this.get('building_slots_total') || 1;
      }
      else {
        var type_id = this.get('type_id');
        if (type_id === 1) {
          total = 3;
        }
        else if (type_id === 2) {
          total = 40;
        }
        else {
          total = 12;
        }
      }
      return total - used;
    }.property('building_slots_total', 'usedBuildingSlots', 'enumerableSlots.@each.building_id').cacheable(),
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.SettlementManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastCharacterUpdates = {};
    var lastLocationUpdates = {};
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerCharacter = {};
    my.runningUpdatesPerLocation = {};
  
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
    
    that.getOwnSettlementsOfType = function(type) {
      var ownSettlements = AWE.GS.SettlementAccess.getAllForOwner_id(AWE.GS.CharacterManager.getCurrentCharacter().getId());
      var foundSettlements = {};
      
      AWE.Ext.applyFunctionToElements(ownSettlements, function(settlement) {
        if (settlement.get('type_id') == type) {
          foundSettlements[settlement.getId()] = settlement;
        }
      });
      
      return foundSettlements;
    }
    
    that.getNextSettlementOfCharacter = function(settlement) {
      if (!settlement) {
        return null;
      }
      var settlementId = settlement.get('id');
      var settlements  = AWE.GS.SettlementAccess.getEnumerableForOwner_id(settlement.get('owner_id')) || [];
      var index        = -1;
      var sorted       = settlements.sort(function(a,b) { return a.get('id') - b.get('id'); });
      sorted.forEach(function(s, i) {
        if (s.get('id') === settlementId) {
          index = i;
        }
      });
      return index < 0 ? null : sorted[(index+1)%sorted.length];
    }    
    
    that.getPreviousSettlementOfCharacter = function(settlement) {
      if (!settlement) {
        return null;
      }
      var settlementId = settlement.get('id');
      var settlements  = AWE.GS.SettlementAccess.getEnumerableForOwner_id(settlement.get('owner_id')) || [];
      var index        = -1;
      var sorted       = settlements.sort(function(a,b) { return a.get('id') - b.get('id'); });
      sorted.forEach(function(s, i) {
        if (s.get('id') === settlementId) {
          index = i;
        }
      });
      return index < 0 ? null : sorted[(index-1+sorted.length)%sorted.length];
    }    
    
    that.getHomeBaseOfCharacter = function(character) {
      var locationId = character.get('base_location_id');
      return locationId ? this.getSettlementAtLocation(locationId) : null;
    }
    
    /** updates the home settlement of the given character. */
    that.updateHomeBaseOfCharacter = function(character, updateType, callback) {
      var locationId = character.get('base_location_id');
      return this.updateSettlementsAtLocation(locationId, updateType, callback);
    }        
    
    /** returns the settlement at locationId or null, if there is no settlement or data. */
    that.getSettlementAtLocation = function(locationId) {
      var settlements = AWE.GS.SettlementAccess.getAllForLocation_id(locationId);
      return AWE.Util.hashFirst(settlements);  // returns the hash's first entry or null for an empty hash
    }
    
    that.lastUpdateForCharacter = function(characterId) {
      if (lastCharacterUpdates[characterId]) {
        return lastCharacterUpdates[characterId];
      }
      else {
        return new Date(1970);
      }
    }
     
    that.lastUpdateForLocation = function(locationId) {
      if (lastLocationUpdates[locationId]) {
        return lastLocationUpdates[locationId];
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
            lastCharacterUpdates[characterId] = timestamp;
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
    
    /** updates all settlements at a given location. Calls the callback with a
     * list of all the updated settlements. */
    that.updateSettlementsAtLocation = function(locationId, updateType, callback) {
      var url = AWE.Config.MAP_SERVER_BASE + 'locations/' + locationId + '/settlements';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerLocation,                      // queue to register this request during execution
        locationId,                                        // regionId to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForLocation(locationId),            // modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK  || status === AWE.Net.NOT_MODIFIED) {
            lastLocationUpdates[locationId] = timestamp;
          }
          // remove deleted settlement from location
          if (status === AWE.Net.OK) {           
            var settlements = module.SettlementAccess.getHashableCollectionForLocation_id(locationId);
            that.fetchMissingEntities(result, settlements.get('collection'), that.updateSettlement);
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