/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Slot class, manager and helpers. */
AWE.GS = (function(module) {
    
  module.SlotAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Slot = module.Entity.extend({     // extends Entity to Settlement
    typeName: 'Slot',
    name: null, 
    
    location_id: null, old_location_id: null,
    locationIdObserver: AWE.Partials.attributeHashObserver(module.ArmyAccess, 'location_id', 'old_location_id').observes('location_id'),
    region_id: null, old_region_id: null,
    regionIdObserver: AWE.Partials.attributeHashObserver(module.ArmyAccess, 'region_id', 'old_region_id').observes('region_id'),
    
    // ---> felder hinzufügen

  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.SlotManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastSlotUpdates = {};
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    // my.runningUpdatesPerRegion = {};  ///< hash that contains all running requests for regions, using the region.id as key.
    // my.runningUpdatesPerLocation = {};///< hash that contains all running requests for locations, using the location.id as key.
    
    my.createEntity = function() { return module.Slot.create(); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getSlot = function(id) {
      return that.getEntity(id);
    }
        
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateSlot = function(id, updateType, callback) {
      var url = AWE.Config.SETTLEMENT_SERVER_BASE+'slots/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
  
    return that;
      
  }());
    
  
  return module;
  
}(AWE.GS || {}));




