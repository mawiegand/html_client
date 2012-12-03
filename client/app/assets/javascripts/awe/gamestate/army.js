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

    owner_id: null, old_owner_id: null,
    ownerIdObserver: AWE.Partials.attributeHashObserver(module.ArmyAccess, 'owner_id', 'old_owner_id').observes('owner_id'),

    owner_name: null,
    alliance_id: null,
    alliance_tag: null,
    
    ap_seconds_per_point: null,
    ap_next: null,
    ap_max: null,
    ap_present: null,
    ap_present_old: null,
    apObserver: ((function() {
      var tmpValue = null;
      return function() {
        var ap = this.get('ap_present');
        this.set('ap_present_old', tmpValue);
        tmpValue = ap;
        log('U ARMY AP', ap);
      };
    })()).observes('ap_present'),
    
    exp: null,
    oldExp: null,
    expObserver: ((function() {
      var tmpValue = null;
      return function() {
        var exp = this.get('exp');
        this.set('oldExp', tmpValue);
        tmpValue = exp;
        log('U ARMY EXP', exp);
      };
    })()).observes('exp'),
    
    rank: null,
    npc: null,
    
    velocity: null,
    garrison: null,
    isGarrisonPropBinding: Ember.Binding.bool('garrison'),
    
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
    
    battle_id: 0, old_battle_id: 0,
    battleIdObserver: AWE.Partials.attributeHashObserver(module.ArmyAccess, 'battle_id', 'old_battle_id').observes('battle_id'),
    
    battle: function() {
      var battleId = this.get('battle_id');
      if (battleId != null) {
        return AWE.GS.BattleManager.getBattle(battleId);
      }
      else {
        return null;
      }
    },

    battleParticipant: function() {
      var self = this;
      var participants = this.battle().getPath('participants.content');
      var participant = null;
      if (participants != null && participants != undefined) {
        participants.forEach(function(p) {
          if (p.get('army_id') === self.getId()) {
            participant = p;
          }
        })
      }
      return participant;
    }.property('battle.participants.content').cacheable(),

    battle_retreat: false,
    
    suspension_ends_at: null,
    
    target_location_id: null,
    target_reached_at: null,
    target_region_id: null,
    
    details: null,
    
    isOwn: function() {
      return this.get('owner_id') === module.CharacterManager.getCurrentCharacter().getId();
    },
    
    isOwnProp: function() {
      return this.isOwn();
    }.property('owner_id', 'AWE.GS.player.currentCharacter').cacheable(),
    
    armyCategory: function() {
      var art = parseFloat(this.get('unitcategory_artillery_strength') || "0.0");
      var cav = parseFloat(this.get('unitcategory_cavalry_strength')   || "0.0");
      var inf = parseFloat(this.get('unitcategory_infantry_strength')  || "0.0");
      var total = (art + cav + inf) || 1.0;   
            
      if (cav / total >= 0.15) { // todo: presently never happens due to missing animation.
        return 'cavalry';
      }
      else if (art / total >= 0.4) {
        return 'artillery';
      }
      return 'infantry';
    }.property('unitcategory_artillery_strength', 'unitcategory_cavalry_strength', 'unitcategory_infantry_strength'),
    
    rankToDisplay: function() {
      return (this.get('rank') || 0 ) + 1;
    }.property('rank').cacheable(),
    
    isFighting: function() {
      return this.get('battle_id') > 0;
    }.property('battle_id').cacheable(),
    
    isSuspended: function() {
      return this.get('suspension_ends_at') !== null && Date.parseISODate(this.get('suspension_ends_at')).getTime() > AWE.GS.TimeManager.estimatedServerTime().getTime();
    }.property('suspension_ends_at').cacheable(),
    
    isMoving: function() {
      return this.get('mode') === 1;
    }.property('mode').cacheable(),    
    
    isGarrison: function() {
      return this.get('garrison');
    },  
    
    isMovable: function() {
      return !this.get('isFighting') && !this.isGarrison();
    },
    
    isDefendingFortress: function() {
      return this.get('stance') == 1;
    }.property('stance').cacheable(),
    
    stanceString: function() {
      return (this.get('isDefendingFortress') ? AWE.I18n.lookupTranslation('general.yes') : AWE.I18n.lookupTranslation('general.no'));
    }.property('isDefendingFortress').cacheable(),
    
    empty: function() {
      return false;
    },
    
    relation: function() {
      return module.Relation.relationTo(this.get('owner_id'), this.get('alliance_id'));
    },
    
    hasSettlementFounder: function() {
      var details = this.get('details');
      if (details === null) {
        return false;
      } 
      var rules = AWE.GS.RulesManager.getRules();
      var numSettlementFounders = 0;
      rules.unit_types.forEach(function(unit_type) {
        if (unit_type.can_create !== undefined && unit_type.can_create !== null &&
            unit_type.can_create.length > 0 &&
            details[unit_type.db_field] !== undefined && details[unit_type.db_field] !== null &&
            details[unit_type.db_field] > 0) {
          numSettlementFounders += details[unit_type.db_field];
        }
      });
      if (numSettlementFounders > 0) {
        log('UNIT CAN FOUND SETTLEMENTS', numSettlementFounders);
      }
      return numSettlementFounders > 0;
    }.property('details.updated_at', 'updated_at').cacheable(),
    
    isReadyToFoundSettlement: function() {
      return this.get('hasSettlementFounder') && this.get('ap_present') >= 1 && !this.get('isFighting') && !this.get('isMoving') && !this.isGarrison();
    },
    
    /** this is the function that collects all conditions together
     * an decides, whether or not the army can found an settlement
     * at the present location JUST NOW (given available action points,
     * settlement points, etc.) */
    canFoundSettlementAtPresentLocationNow: function() {
      var owner    = AWE.GS.CharacterManager.getCharacter(this.get('owner_id'));
      var location = AWE.Map.Manager.getLocation(this.get('location_id'));
      return this.isReadyToFoundSettlement() && owner && owner.canFoundSettlement() && location && location.canFoundSettlementHere(owner);
    },
    
    calcMinExpOfRank: function(rank) {
      rank = rank || 0;

      if (rank == 0) {
        return 0;
      }
      else if (rank == 1) {
        return 30;
      }
      else if (rank == 2) { 
        return 60;
      }
      else {
        return this.calcMinExpOfRank(rank-1) + this.calcMinExpOfRank(rank-2);  // uses a recursive calculation pattern
      }
    },
    
    expForPresentRank: function() {
      return this.calcMinExpOfRank(this.get('rank'));
    }.property('rank').cacheable(),
    
    expForNextRank: function() {
      return this.calcMinExpOfRank((this.get('rank') || 0 ) + 1);
    }.property('rank').cacheable(),
    
    /** set the optional acceptUnkown flag to true, if your want to get a 
     * positive answer for unknown relation state. Just ignore it otherwise.*/
    isRelationAtLeast: function(relation, acceptUnknown) {
      return module.Relation.isRelationToAtLeast(this.get('owner_id'), this.get('alliance_id'), relation, acceptUnknown);
    },
    
    ownerString: function() {
      if (this.get('alliance_tag') && this.get('alliance_tag') != '') {
        return this.get('owner_name') + ' | ' + this.get('alliance_tag');
      }
      else {
        return this.get('owner_name');
      }
    }.property('owner_name', 'alliance_tag').cacheable(),
    
    factionContainsGarrison: function() {
      var battle = this.battle();
      if (battle != null) {
        participants = battle.participantsOfFactionWithArmy(this);
        for (var i = 0; i < participants.length; i++) {
          var participatingArmy = participants[i].get('army');
          if (participatingArmy != null && participatingArmy.get('garrison')) {
            return true;
          }
        }
      }
      return false;
    },
    
    sameAllianceAs: function(location) {
      var armyAllianceId = this.get('alliance_id');
      var locationAllianceId = location.allianceId();
      
      return armyAllianceId != null && armyAllianceId > 0 &&
             locationAllianceId != null && locationAllianceId > 0 &&
             armyAllianceId == locationAllianceId;
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
    my.runningUpdatesPerCharacter = {};///< hash that contains all running requests for locations, using the location.id as key.
    
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
    that.getArmiesOfCharacter = function(id) { 
      return AWE.GS.ArmyAccess.getAllForOwner_id(id)
    }   
    
    that.getNextArmyOfCharacter = function(army) {
      if (!army) {
        return null;
      }
      var armyId = army.get('id');
      var armies = AWE.GS.ArmyAccess.getEnumerableForOwner_id(army.get('owner_id')) || [];
      var index = -1;
      var filtered = armies.filter(function(a) {
        return !a.isGarrison();
      });
      filtered.forEach(function(a, i) {
        if (a.get('id') == armyId) {
          index = i;
        }
      });
      return index < 0 ? null : filtered[(index+1)%filtered.length];
    }
    
    that.getPreviousArmyOfCharacter = function(army) {
      if (!army) {
        return null;
      }
      var armyId = army.get('id');
      var armies = AWE.GS.ArmyAccess.getEnumerableForOwner_id(army.get('owner_id')) || [];
      var index = -1;
      var filtered = armies.filter(function(a) {
        return !a.isGarrison();
      });
      filtered.forEach(function(a, i) {
        if (a.get('id') == armyId) {
          index = i;
        }
      });
      return index < 0 ? null : filtered[(index-1+filtered.length)%filtered.length];
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
            module.ArmyAccess.accessHashForRegion_id().setLastUpdateAtForValue(regionId, timestamp.add(-1).second());
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
            module.ArmyAccess.accessHashForLocation_id().setLastUpdateAtForValue(locationId, timestamp.add(-1).second());
          }
          // remove deleted army from location
          if (status === AWE.Net.OK) {           
            var armies = module.ArmyAccess.getHashableCollectionForLocation_id(locationId);
            that.fetchMissingEntities(result, armies.get('collection'), that.updateArmy); // careful: this breaks "this" inside updateArmy  
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
    
    that.updateArmiesForCharacter = function(characterId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE+'characters/'+characterId+'/armies';
      return my.fetchEntitiesFromURL(
        url, 
        my.runningUpdatesPerLocation, 
        characterId, 
        updateType, 
        module.ArmyAccess.lastUpdateForOwner_id(characterId),
        function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.ArmyAccess.accessHashForOwner_id().setLastUpdateAtForValue(characterId, timestamp.add(-1).second());
          }
          // remove deleted army from location
          if (status === AWE.Net.OK) {           
            var armies = module.ArmyAccess.getHashableCollectionForOwner_id(characterId);
            that.fetchMissingEntities(result, armies.get('collection'), that.updateArmy); // careful: this breaks "this" inside updateArmy  
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.ArmyAccess.getAllForOwner_id(characterId);
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
            lastFortressUpdates[regionId] = timestamp.add(-1).second();
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




