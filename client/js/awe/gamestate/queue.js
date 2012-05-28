/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Queue class, manager and helpers. */
AWE.GS = (function(module) {
    
  module.QueueAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Queue = module.Entity.extend({     // extends Entity to Settlement
    typeName: 'Queue',
    name: null, 
    
    settlement_id: null, old_settlement_id: null, ///< id of the settlement the queue is a member of
    settlementIdObserver: AWE.Partials.attributeHashObserver(module.QueueAccess, 'settlement_id', 'old_settlement_id').observes('settlement_id'),
    
    type_id: null,
    speed: null,
    max_length: null,
    threads: null,
    jobs_count: null,
    
    active_jobs: [] // TODO: was bauen, um die Jobs als Ember-Objekte da rein zu packen
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.QueueManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastQueueUpdates = {};
    
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerSettlement = {};
  
    my.createEntity = function() { return module.Queue.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getQueue = function(id) {
      return that.getEntity(id);
    }
        
    that.getQueuesOfSettlement = function(settlementId) {
      return AWE.GS.QueueAccess.getAllForSettlement_id(settlementId);
    }
    
    that.lastUpdateForSettlement = function(settlementId) {
      if (lastQueueUpdates[settlementId]) {
        return lastQueueUpdates[settlementId];
      }
      else {
        return new Date(1970);
      }
    }
        
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateQueue = function(id, updateType, callback) {
      var url = AWE.Config.CONSTRUCTION_SERVER_BASE + 'queues/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    /** updates all settlements for the current character. Calls the callback with a
     * list of all the updated settlements. */
    
    
    that.updateQueuesOfSettlement = function(settlementId, updateType, callback) {
      var url = AWE.Config.SETTLEMENT_SERVER_BASE + 'settlements/' + settlementId + '/queues';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerSettlement,                     // queue to register this request during execution
        settlementId,                                       // regionId to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForSettlement(settlementId),                              // modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            lastQueueUpdates[settlementId] = timestamp;
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