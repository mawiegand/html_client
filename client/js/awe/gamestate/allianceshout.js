/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Character class, manager and helpers. */
AWE.GS = (function(module) {

  module.AllianceShoutAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   ALLIANCESHOUT
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.AllianceShout = module.Entity.extend({     // extends Entity to Army
    typeName: 'Alliance',           ///< identifies instances of this type
    character_id: null, old_character_id: null,             ///< character that posted this message
    characterIdObserver: AWE.Partials.attributeHashObserver(module.AllianceShoutAccess, 'character_id', 'old_character_id').observes('character_id'),

    alliance_id: null,  old_alliance_id: null,            ///< alliance for which this message was posted
    allianceIdObserver: AWE.Partials.attributeHashObserver(module.AllianceShoutAccess, 'alliance_id', 'old_alliance_id').observes('alliance_id'),

    posted_ago_in_words: null,
    
    message: null                   ///< the message
  });

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ALLIANCESHOUT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.AllianceShoutManager = (function(my) {    // AllianceShoutManager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;


    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.runningUpdatesPerAllicance = {};///< hash that contains all running requests for alliances, using the alliance.id as key.
    
    my.createEntity = function(spec) { return module.AllianceShout.create(spec); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);

    that.getMessage = function(id) { return that.getEntity(id); };
    that.getMessagesOfAlliance = function(id) {
      return module.AllianceShoutAccess.getAllForAlliance_id(id)
    };
    that.lastUpdateAtForAllianceId = function(allianceId, updateType) {
      return module.AllianceShoutAccess.lastUpdateForAlliance_id(allianceId, updateType);// modified after
    };

  
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateMessage = function(id, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE+'alliance_shouts/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
  
    /** updates all armies in a given alliance. Calls the callback with a
     * list of all the updated characters. */
    that.updateMessagesOfAlliance = function(allianceId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE+'alliances/'+allianceId+'/alliance_shouts';
      return my.fetchEntitiesFromURL(
        url,                                  // url to fetch from
        my.runningUpdatesPerAllicance,        // queue to register this request during execution
        allianceId,                           // regionId to fetch -> is used to register the request
        updateType,                           // type of update (aggregate, short, full)
        module.AllianceShoutAccess.lastUpdateForAlliance_id(allianceId), // modified after
        function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.AllianceShoutAccess.accessHashForAlliance_id().setLastUpdateAtForValue(allianceId, timestamp);
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.AllianceShoutAccess.getAllForAlliance_id(allianceId);
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


