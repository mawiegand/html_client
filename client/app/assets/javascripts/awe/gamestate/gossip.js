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
      if (endedAt != null) {
        log('ENDED', Date.parseISODate(endedAt).getTime(), AWE.GS.TimeManager.estimatedServerTime().add(-1).seconds().getTime());
        return Date.parseISODate(endedAt).getTime() < AWE.GS.TimeManager.estimatedServerTime().add(-1).seconds().getTime();
      }
      else {
        return true;
      }
    }.property('ended_at'),
    
    
    localizedDescription: function() {
      return gossipFor(this.get('content_type'), this.get('content'));
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
      var gossip = module.game.get('gossip');
      if (gossip !== undefined && gossip !== null) {
        var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'gossip';
        return my.updateEntity(url, 1, updateType, callback); 
      }
      else {
        var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'gossip';
        return my.fetchEntitiesFromURL(
          url, 
          my.runningUpdatesPerId, 
          1, 
          updateType, 
          null,
          function(gossip, statusCode, xhr, timestamp) {
            if (statusCode === AWE.Net.OK) {
              module.game.set('gossip', gossip);
            }
            if (callback) {
              callback(gossip, statusCode, xhr, timestamp);
            }
          }
        );
      }        
    }
    
    return that;
      
  }());
  
  var gossips = {
    "most_liked_player" : function(content) {
      var string = AWE.I18n.lookupTranslation('building.gossip.likeLeader');
      return string.format(content.name, content.likes);
    },
    
    "resource_type_production_leader" : function(content) {
      var male = content.male === null || content.male;
      var string = male ? AWE.I18n.lookupTranslation('building.gossip.resourceProductionLeader.male') : AWE.I18n.lookupTranslation('building.gossip.resourceProductionLeader.female');
      var resourceType = AWE.GS.RulesManager.getRules().getResourceType(content.resource_id);
      return string.format(content.name, AWE.Util.Rules.lookupTranslation(resourceType.name), parseInt(content.rate));
    },
  }
  
  
  var gossipFor = function(type, content) {
    var gossipFunction = gossips[type];
    
    if (type === "random_advice" || !gossipFunction) {
      return AWE.I18n.lookupTranslation('building.gossip.advice');
    }
    else {
      return gossipFunction(content);
    }
  }
    
  
  return module;
  
}(AWE.GS || {}));


