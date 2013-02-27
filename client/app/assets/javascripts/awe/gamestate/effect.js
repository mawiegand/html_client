/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
    
  module.CharacterResourceEffectAccess = {};

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
   * @name AWE.GS.CharacterResourceEffect */
  module.CharacterResourceEffect = module.Entity.extend( /** @lends AWE.GS.CharacterResourceEffect# */ {
    typeName: 'CharacterResourceEffect',

    resource_pool_id: null,
    old_resource_pool_id: null,
    resourcePoolIdObserver: AWE.Partials.attributeHashObserver(module.CharacterResourceEffectAccess, 'resource_pool_id', 'old_resource_pool_id').observes('resource_pool_id'),

    type_id: null,
    origin_id: null,
    bonus: null,
    resource_id: null,
    finished_at: null,

    type: function() {
      switch (this.get('type_id')) {
        case 0:
          return 'Kaufbonus';
        case 1:
          return 'Artefakt';
        default:
          return 'Unbekannt';
      }
    }.property('type_id').cacheable(),
  });

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.CharacterResourceEffectManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastResourcePoolUpdates = {};
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerResourcePool = {};
  
    my.createEntity = function() {
      return module.CharacterResourceEffect.create();
    };
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getCharacterResourceEffect = function(id) {
      return that.getEntity(id);
    };
        
    that.getResourceEffectsOfResourcePool = function(poolId) {
      return AWE.GS.CharacterResourceEffectAccess.getEnumerableForResource_pool_id(poolId);
    };
    
    that.lastUpdateForResourcePool = function(poolId) {
      if (lastResourcePoolUpdates[poolId]) {
        return lastResourcePoolUpdates[poolId];
      }
      else {
        return new Date(1970);
      }
    };
     
    /** updates all settlements for the current character. Calls the callback with a
     * list of all the updated settlements. */
    that.updateOwnResourceEffects = function(updateType, callback) {
      var poolId = AWE.GS.ResourcePoolManager.getResourcePool().getId();
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'resource_pools/' + poolId + '/resource_effects';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerResourcePool,                  // queue to register this request during execution
        poolId,                                            // regionId to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForResourcePool(poolId),            // modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            lastResourcePoolUpdates[poolId] = timestamp;
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = that.getEntities();
            }
            callback(result, status, xhr, timestamp);
          }
        }
      )
    };
  
    return that;
      
  }());
    
  module.AllianceResourceEffectAccess = {};

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
   * @name AWE.GS.CharacterResourceEffect */
  module.AllianceResourceEffect = module.Entity.extend( /** @lends AWE.GS.CharacterResourceEffect# */ {
    typeName: 'CharacterResourceEffect',

    alliance_id: null,
    old_alliance_id: null,
    allianceIdObserver: AWE.Partials.attributeHashObserver(module.AllianceResourceEffectAccess, 'alliance_id', 'old_alliance_id').observes('alliance_id'),

    type_id: null,
    origin_id: null,
    bonus: null,
    resource_id: null,

    type: function() {
      switch (this.get('type_id')) {
        case 0:
          return 'Kaufbonus';
        case 1:
          return 'Artefakt';
        default:
          return 'Unbekannt';
      }
    }.property('type_id').cacheable(),
  });


  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////

  module.AllianceResourceEffectManager = (function(my) {    // Army.Manager    -> manager singleton

    // private attributes and methods //////////////////////////////////////

    var that;
    var lastAllianceUpdates = {};

    // protected attributes and methods ////////////////////////////////////

    my = my || {};

    my.runningUpdatesPerAlliance = {};

    my.createEntity = function() {
      return module.AllianceResourceEffect.create();
    };

    // public attributes and methods ///////////////////////////////////////

    that = module.createEntityManager(my);

    that.getAllianceResourceEffect = function(id) {
      return that.getEntity(id);
    };

    that.getResourceEffectsOfAlliance = function(allianceId) {
      return AWE.GS.AllianceResourceEffectAccess.getEnumerableForAlliance_id(allianceId);
    };

    that.lastUpdateForAlliance = function(allianceId) {
      if (lastAllianceUpdates[allianceId]) {
        return lastAllianceUpdates[allianceId];
      }
      else {
        return new Date(1970);
      }
    };

    /** updates all settlements for the current character. Calls the callback with a
     * list of all the updated settlements. */
    that.updateAllianceResourceEffects = function(updateType, callback) {
      var allianceId = AWE.GS.game.getPath('currentCharacter.alliance_id');
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'alliances/' + allianceId + '/alliance_resource_effects';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerAlliance,                      // queue to register this request during execution
        allianceId,                                        // regionId to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForAlliance(allianceId),            // modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            lastAllianceUpdates[allianceId] = timestamp;
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = that.getEntities();
            }
            callback(result, status, xhr, timestamp);
          }
        }
      )
    };

    return that;

  }());


  return module;
  
}(AWE.GS || {}));