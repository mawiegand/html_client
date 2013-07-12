/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2013 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  // ///////////////////////////////////////////////////////////////////////
  //
  //   GOSSIP
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Gossip = module.Entity.extend({
    typeName: 'Gossip',
    
    ended_at:     null,
    content_type: null,
    content:      null,
    
    hasEnded: function() {
      var endedAt = this.get('ended_at');
      if (startedAt != null) {
        return Math.floor((new Date().getTime() - Date.parseISODate(startedAt).getTime())/(24 * 3600 * 1000));
      }
      else {
        return 0;
      }
    }.property('ended_at').cacheable(),
    
    
    localizedDescription: function() {
      return "Gossip";
    }.property('ended_at', 'content_type').cacheable(),
    
  });

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   GOSSIP MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.GossipManager = (function(my) {
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastGossipUpdate = null;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.createEntity = function(spec) { return module.Gossip.create(spec); }

    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
      
    that.lastUpdateForGossip = function() {
      return lastGossipUpdate ? lastGossipUpdate : new Date(1970);
    };
  
    that.updateGossip = function(updateType, callback) {
      var self = this;
      var gossip = module.game.get('roundInfo');
      if (roundInfo !== undefined && roundInfo !== null) {
        var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'round_info';
        return my.updateEntity(url, 1, updateType, callback); 
      }
      else {
        var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'round_info';
        return my.fetchEntitiesFromURL(
          url, 
          my.runningUpdatesPerId, 
          1, 
          updateType, 
          null,
          function(roundInfo, statusCode, xhr, timestamp) {
            if (statusCode === AWE.Net.OK) {
              module.game.set('roundInfo', roundInfo);
            }
            if (callback) {
              callback(roundInfo, statusCode, xhr, timestamp);
            }
          }
        );
      }        
    }
    
    return that;
      
  }());
    
  
  return module;
  
}(AWE.GS || {}));


