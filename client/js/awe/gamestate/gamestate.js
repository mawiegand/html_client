/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState base class, manager and helpers. */
AWE.GS = (function(module) {
  
  module.ENTITY_UPDATE_TYPE_AGGREGATE = 0;  ///< shortest type of update, just the ID and very basic data
  module.ENTITY_UPDATE_TYPE_SHORT = 0;      ///< short type of update, only including the most important fields (e.g. for displaying on map)
  module.ENTITY_UPDATE_TYPE_FULL = 0;       ///< longest type of update, including all fields of the entity

  /** Base class of all classes that represent states & entities of the game. */
  module.createEntity = function(spec, my) {
    
    // private attributes and methods ////////////////////////////////////////
    
    var that;
  
    // protected attributes and methods //////////////////////////////////////
  
    my = my || {};
    
    my.id = null;                       ///< unique id of this entity on the server

    my.updatedAt = null;                ///< last change on server
    my.createdAt = null;                ///< time of creation on server    
    
    my.lastAggregateUpdateAt = null;    ///< time of last aggregate update received by the client
    my.lastShortUpdateAt = null;        ///< time of last short update received by the client
    my.lastFullUpdateAt = null;         ///< time of last full update received by the client
    
    // public attributes and methods /////////////////////////////////////////
    
    that = {};
    
    that.lastAggregateUpdateInClient = function() {
      
    }
    
    that.lastShortUpdateInClient = function() {
      
    }
    
    that.lastFullUpdateInClient = function() {
      
    }
    
    that.lastUpdateInClientOfAtLeast = function(tpyeOfUpdate) {
      var lastUpdate = my.lastFullUpdateAt;    // full update also includes short and aggregate update
      if (typeOfUpdate == module.ENTITY_UPDATE_TYPE_SHORT || typeOfUpdate == module.ENTITY_UPDATE_TYPE_AGGREGATE &&
          (!lastUpdate || lastUpdate < my.lastShortUpdate)) {
        lastUpdate = my.lastShortUpdate;       // if short update was later and ok for the typeOfUpdate asked, use that one.
      }
      if (typeOfUpdate == module.ENTITY_UPDATE_TYPE_AGGREGATE && 
          (!lastUpdate || lastUpdate < my.lastAggregateUpdateAt)) {
        lastUpdate = my.lastShortUpdate;       // if aggregate update was later and typeOfUpdate is just aggregate, use that one.
      }
    }
    
    
    
    that.updateWith = function(updateType) {
      
    }
    
    return that;
  };

  return module;
  
}(AWE.Ext || {}));