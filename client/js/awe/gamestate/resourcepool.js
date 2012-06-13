/* Author: Patrick Fox <patrick@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Resource Pool class, manager and helpers. */
AWE.GS = (function(module) {
    
  module.ResourcePoolAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   RESOURCE POOL
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.ResourcePool = module.Entity.extend({     // extends Entity to Resource Pool
    typeName: 'ResourcePool',          ///< identifies instances of this type
    
    // resources

    character_id: null,
    
    productionUpdatedAt: null,

    resource_cash_amount: null,
    resource_cash_capacity: null,
    resource_cash_production_rate: null,

    resource_fur_amount: null,
    resource_fur_capacity: null,
    resource_fur_production_rate: null,

    resource_stone_amount: null,
    resource_stone_capacity: null,
    resource_stone_production_rate: null,

    resource_wood_amount: null,
    resource_wood_capacity: null,
    resource_wood_production_rate: null,
  
    locked_at: null,
    locked_by: null,
    locked_reason: null,
    
    // link to character
    
    
    // methods if needed...
    
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   RESOURCE POOL MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.ResourcePoolManager = (function(my) {    // ResourcePoolManager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastResourcePoolUpdate = null;
    

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    // my.runningUpdatesPerAllicance = {};///< hash that contains all running requests for alliances, using the alliance.id as key.
    my.runningUpdatesPerCharacterId = {};         ///< hash that contains all running requests for characters, using the id as key.

    my.createEntity = function(spec) { return module.ResourcePool.create(spec); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
    
    that.resourcePool = null;
  
    that.getResourcePool = function() {
      return this.resourcePool;
    };
    
    that.lastUpdateForResourcePool = function() {
      return lastResourcePoolUpdate ? lastResourcePoolUpdate : new Date(1970);
    };
  
  
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateResourcePool = function(updateType, callback) {
      if (this.resourcePool) {
        var id = this.resourcePool.getId();
        var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'resource_pools/' + id;
        return my.updateEntity(url, id, updateType, callback);
      }
      else { // no resource pool, need to fetch it
        var self = this;
        var characterId = AWE.GS.CharacterManager.getCurrentCharacter().getId();
        var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/' + characterId + '/resource_pool';
        return my.fetchEntitiesFromURL(
          url, 
          my.runningUpdatesPerCharacterId, 
          characterId,
          updateType, 
          null,
          function(pool, statusCode, xhr, timestamp) {
            if (statusCode === AWE.Net.OK) {
              self.resourcePool = pool;
            }
            if (callback) {
              callback(pool, statusCode, xhr, timestamp);
            }
          }
        );
      }        
    }
    
    return that;
      
  }());
    
  
  return module;
  
}(AWE.GS || {}));


