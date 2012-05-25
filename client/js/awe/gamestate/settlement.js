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
    
    // ---> felder hinzufügen

  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.SettlementManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastSettlementUpdate = null;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdates = {};
  
    // my.runningUpdatesPerRegion = {};  ///< hash that contains all running requests for regions, using the region.id as key.
    // my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
    
    my.createEntity = function() { return module.Settlement.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getSettlement = function(id) {
      return that.getEntity(id);
    }
        
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateSettlement = function(id, updateType, callback) {
      var url = AWE.Config.SETTLEMENT_SERVER_BASE + 'settlements/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    /** updates all armies in a given region. Calls the callback with a
     * list of all the updated armies. */
    that.updateOwnSettlements = function(updateType, callback) {
      var url = AWE.Config.SETTLEMENT_SERVER_BASE + 'settlements';
      return my.fetchEntitiesFromURL(
        url,                                  // url to fetch from
        my.runningUpdates,           // queue to register this request during execution
        1,                             // regionId to fetch -> is used to register the request
        updateType,                           // type of update (aggregate, short, full)
        lastSettlementUpdate, // modified after
        function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            lastSettlementUpdate = timestamp;
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

$(function(){
  log('START LOADING SETTLEMENTS');
  

  AWE.GS.SettlementManager.updateOwnSettlements(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
    alert('settlement callback');
  }); 
  
  log('END LOADING SETTLEMENTS');
});




