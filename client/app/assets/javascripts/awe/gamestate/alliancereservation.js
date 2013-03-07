/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {

  module.AllianceReservationAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   ALLIANCE RESERVATION
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.AllianceReservation = module.Entity.extend({
    typeName: 'AllianceReservation',

    alliance_id: null,  old_alliance_id: null,
    allianceIdObserver: AWE.Partials.attributeHashObserver(module.AllianceReservationAccess, 'alliance_id', 'old_alliance_id').observes('alliance_id'),

    tag: null,
    name: null,
    password: null,
  });

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ALLIANCE RESERVATION MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.AllianceReservationManager = (function(my) {
  
    // private attributes and methods //////////////////////////////////////
  
    var that;


    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.runningUpdatesPerAllicance = {};///< hash that contains all running requests for alliances, using the alliance.id as key.
    
    my.createEntity = function(spec) {
      return module.AllianceReservation.create(spec);
    };

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);

    that.getAllianceReservation = function(id) {
      return that.getEntity(id);
    };

    that.getReservationOfAlliance = function(allianceId) {
      var reservations = AWE.GS.AllianceReservationAccess.getEnumerableForAlliance_id(allianceId);
      log('----> manager', reservations);
      return reservations != null ? reservations[0] : null;
    };

    that.updateAllianceReservation = function(id, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'alliance_reservations/' + id;
      return my.updateEntity(url, id, updateType, callback);
    };

    that.updateReservationsOfAlliance = function(allianceId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'alliances/' + allianceId + '/alliance_reservation';
      return my.fetchEntitiesFromURL(
        url,                                     // url to fetch from
        my.runningUpdatesPerAllicance,           // queue to register this request during execution
        allianceId,                              // regionId to fetch -> is used to register the request
        updateType,                              // type of update (aggregate, short, full)
        module.AllianceReservationAccess.lastUpdateForAlliance_id(allianceId), // modified after
        function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.AllianceReservationAccess.accessHashForAlliance_id().setLastUpdateAtForValue(allianceId, timestamp.add(-1).second());
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.AllianceReservationAccess.getAllForAlliance_id(allianceId);
            }
            callback(result, status, xhr, timestamp);
          }
        }
      );
    };

    return that;

  }());

  return module;

}(AWE.GS || {}));


