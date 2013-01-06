/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.AllianceAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   Alliance
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Alliance = module.Entity.extend({     // extends Entity to Alliance
    typeName: 'Alliance',           ///< identifies instances of this type
    identifier: null,               ///< unique identifier assigned by identity_provider
    name: null,                     ///< name of the alliance
    tag: null,
    description: null,
    leader_id: null,
    password: null,
    
    locked: false,                  ///< TODO: don't communicate this!
    locked_by: null,
    locked_at: null,
    
    victory_progresses: [],
        
    hashableShouts: function() {
      var id = this.get('id');
      return id ? AWE.GS.AllianceShoutAccess.getHashableCollectionForAlliance_id(id) : null;
    }.property('id').cacheable(),  
    
    hashableMembers: function() {
      var id = this.get('id');
      return id ? AWE.GS.CharacterAccess.getHashableCollectionForAlliance_id(id) : null;
    }.property('id').cacheable(),
    
    membersCount: function() {
      var members = this.get('members');
      return members.filter(function(member) {
        return member != null;
      }).get('length');
    }.property('members').cacheable(),    
    
    members: function() {
      return this.getPath('hashableMembers.collection');
    }.property('hashableMembers.changedAt').cacheable(),
    
    shouts: function() {
      log('SHOUTS')
      return this.getPath('hashableShouts.collection');
    }.property('hashableShouts.changedAt').cacheable(),    
    
    leader: function() {
      var hash = this.getPath('hashableMembers.hash');
      var leaderId = this.get('leader_id');
      return hash && leaderId ? hash[leaderId] : null;
    }.property('hashableMembers.changedAt', 'leader_id').cacheable(),
        
  });     



    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ALLIANCE MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.AllianceManager = (function(my) {    // AllianceManager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastCurrentCharacterUpdate = null;
    

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
      

    my.createEntity = function(spec) {
      return module.Alliance.create({
        victory_progresses: Ember.ArrayProxy.create({          
          baseTypeName: 'VictoryProgress',
          content: Ember.A([]),
        }),
      });        
    }

    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
      
    that.getAlliance = function(id) { return that.getEntity(id); };
    
  
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateAlliance = function(id, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE+'alliances/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    that.colorForNumber = function(number) {
      return { r: ((number*5 % 3) * 80 + number*9) % 256  , 
               g: (((number % 5) * 50) + number*7) % 256, 
               b: ((3-(number % 3)) * 80 + number*3) % 256 };
    };
    
    return that;
      
  }());
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   VICTORY PROGRESS
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.VictoryProgress = module.Entity.extend({
    typeName: 'VictoryProgress',
    victory_type: null,
    alliance_id: null,
    fulfillment_count: null,
    first_fulfilled_at: null,
    
    victoryType: function() {
      return AWE.GS.RulesManager.getRules().get('victory_types')[this.get('victory_type')];
    }.property('victory_type').cacheable(),
    
    fulfilled: function() {
      return this.get('fulfillmentRatio') >= 1;
    }.property('fulfillmentRatio').cacheable(),
    
    fulfillmentRatio: function() {
      var allRegions = AWE.GS.game.roundInfo.get('regions_count');
      var allianceRegions = this.get('fulfillment_count');
      var reqRegionsRatio = AWE.GS.Util.parseAndEval(this.getPath('victoryType.condition.required_regions_ratio'), AWE.GS.game.roundInfo.get('age'), 'DAYS');
      var fulfillmentRatio = 1.0 * (allianceRegions / allRegions) / reqRegionsRatio;
      return (fulfillmentRatio > 1) ? 1 : fulfillmentRatio;
    }.property('alliance_id', 'fulfillment_count', 'AWE.GS.game.roundInfo.regions_count', 'victoryType.condition.required_regions_ratio', 'AWE.GS.game.roundInfo.started_at').cacheable(),
    
    fulfillmentDurationRatio: function() {
      var firstFulfilledAt = this.get('first_fulfilled_at');
      var reqDuration = this.getPath('victoryType.condition.duration')
      if (firstFulfilledAt != null) {
        var duration = (new Date().getTime() - Date.parseISODate(firstFulfilledAt).getTime())/(24 * 3600 * 1000);
        return 1.0 * duration / reqDuration;
      }
      else {
        return 0;
      }
    }.property('alliance_id', 'first_fulfilled_at', 'victory_type').cacheable(),
    
    daysRemaining: function() {
      var reqDuration = this.getPath('victoryType.condition.duration');
      return AWE.UI.Util.round(reqDuration * (1 - this.get('fulfillmentDurationRatio')));
    }.property('victoryType', 'fulfillmentDurationRatio').cacheable(),
    
    endDate: function() {
      return this.get('first_fulfilled_at');
    }.property('first_fulfilled_at').cacheable(),
    
    progressLeaders: function() {
      var self = this;
      var victoryProgressLeaders = AWE.GS.game.get('victoryProgressLeaders');
      var leadersOfThisType = [];
      if (victoryProgressLeaders != null) {
        AWE.Ext.applyFunctionToElements(victoryProgressLeaders, function(leader) {
          if (leader.get('victory_type') === self.get('victory_type')) {
            leadersOfThisType.push(leader);
          }
        })
      }
      return leadersOfThisType;
    }.property('AWE.GS.game.victoryProgressLeaders').cacheable(),
    
    progressLeaderFirst: function() {
      var progressLeaders = this.get('progressLeaders');
      var first = null;
      if (progressLeaders != null) {
        first = progressLeaders.filter(function(leader) {
          return leader.get('pos') === 1;
        })[0];
      }
      return first;
    }.property('progressLeaders').cacheable(),
    
    progressLeaderSecond: function() {
      var progressLeaders = this.get('progressLeaders');
      var second = null;
      if (progressLeaders != null) {
        second = progressLeaders.filter(function(leader) {
          return leader.get('pos') === 2;
        })[0];
      }
      return second;
    }.property('progressLeaders').cacheable(),
    
    progressLeaderThird: function() {
      var progressLeaders = this.get('progressLeaders');
      var third = null;
      if (progressLeaders != null) {
        third = progressLeaders.filter(function(leader) {
          return leader.get('pos') === 3;
        })[0];
      }
      return third;
    }.property('progressLeaders').cacheable(),
  });    
  
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ALLIANCE MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.VictoryProgressManager = (function(my) {
  
    // private attributes and methods //////////////////////////////////////
  
    var that;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
      
    my.runningUpdates = {};         ///< hash that contains all running requests for characters, using the id as key.

    my.createEntity = function(spec) {
      return module.VictoryProgress.create();        
    }

    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
    
    that.updateLeaders = function(callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'victory_progress_leaders';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdates,                                 // queue to register this request during execution
        0,                                                 
        AWE.GS.ENTITY_UPDATE_TYPE_FULL,                    // type of update (aggregate, short, full)
        null,                                              // modified after
        function(result, statusCode, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (statusCode === AWE.Net.OK) {
            lastUpdate = timestamp.add(-1).second();
            AWE.GS.game.set('victoryProgressLeaders', result);
          }
          if (callback) {
            callback(result, statusCode, xhr, timestamp);
          }
        }
      ); 
    };

    return that;
      
  }());
    
  return module;
  
}(AWE.GS || {}));


