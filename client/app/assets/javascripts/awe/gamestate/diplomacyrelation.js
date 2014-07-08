/* Author: Marcel Wiegand <marcel@5dlab.com>,
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {

  module.DiplomacyRelationAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   DIPLOMACYRELATION
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.DiplomacyRelation = module.Entity.extend({     // extends Entity to Diplomacy Relation
    typeName: 'DiplomacyRelation',                                   ///< identifies instances of this type
    
    source_alliance_id: null, old_source_alliance_id: null,
    sourceAllianceIdObserver: AWE.Partials.attributeHashObserver(module.DiplomacyRelationAccess, 'source_alliance_id', 'old_source_alliance_id').observes('source_alliance_id'),
    
    target_alliance_id: null, old_target_alliance_id: null,
    targetAllianceIdObserver: AWE.Partials.attributeHashObserver(module.DiplomacyRelationAccess, 'target_alliance_id', 'old_target_alliance_id').observes('target_alliance_id'),
    
    diplomacy_status: null,
    
    initiator: false
  });

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   DIPLOMACYRELATION MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.DiplomacyRelationManager = (function(my) {    // DiplomacyRelationManager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;


    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.runningUpdatesPerAlliance = {};///< hash that contains all running requests for alliances, using the alliance.id as key.
    
    my.createEntity = function(spec) { return module.DiplomacyRelation.create(spec); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);

    that.getDiplomacyRelation = function(id) { return that.getEntity(id); };
    that.getDiplomacyRelationsOfAlliance = function(id) {
      return module.DiplomacyRelationAccess.getAllForSource_alliance_id(id)
    };
    that.lastUpdateAtForSourceAllianceId = function(allianceId, updateType) {
      return module.DiplomacyRelationAccess.lastUpdateForSource_alliance_id(allianceId, updateType);// modified after
    };
    
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateDiplomacyRelation = function(id, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE+'diplomacy_relations/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
  
    /** updates all diplomacy relations for a given alliance.*/
    that.updateDiplomacyRelationsOfAlliance = function(allianceId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE+'alliances/'+allianceId+'/diplomacy_relations';
      return my.fetchEntitiesFromURL(
        url,                                  // url to fetch from
        my.runningUpdatesPerAlliance,        // queue to register this request during execution
        allianceId,                           // allianceId to fetch -> is used to register the request
        updateType,                           // type of update (aggregate, short, full)
        module.DiplomacyRelationAccess.lastUpdateForSource_alliance_id(allianceId), // modified after
        function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.DiplomacyRelationAccess.accessHashForSource_alliance_id().setLastUpdateAtForValue(allianceId, timestamp.add(-1).second());
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.DiplomacyRelationAccess.getAllForSource_alliance_id(allianceId);
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


