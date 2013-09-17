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
    
    victoryProgressesBinding: 'AWE.GS.game.victoryProgresses',
        
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

    that.colorForAlliance = function(number, color) {

      if (color != null) {
        return { r: Math.floor(color / (256 * 256) % 256),
                 g: Math.floor(color / 256 % 256),
                 b: Math.floor(color % 256)
        };
      }
      else {
        return { r: ((number*5 % 3) * 80 + number*9) % 256,
                 g: (((number % 5) * 50) + number*7) % 256,
                 b: ((3-(number % 3)) * 80 + number*3) % 256
        };
      }
    };

    return that;
      
  }());
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   VICTORY PROGRESS
  //
  // ///////////////////////////////////////////////////////////////////////    

  module.VICTORY_TYPE_DOMINATION = 0;
  module.VICTORY_TYPE_ARTIFACTS  = 1;
  module.VICTORY_TYPE_POPULARITY = 2;
  module.VICTORY_TYPE_SCIENCE    = 3;

  module.VictoryProgressAccess = {};

  module.VictoryProgress = module.Entity.extend({
    typeName: 'VictoryProgress',
    type_id: null,
    fulfillment_count: null,
    first_fulfilled_at: null,

    alliance_id: null,  old_alliance_id: null,
    allianceIdObserver: AWE.Partials.attributeHashObserver(module.VictoryProgressAccess, 'alliance_id', 'old_alliance_id').observes('alliance_id'),

    victoryType: function() {
      var rules = AWE.GS.RulesManager.getRules();
      return rules ? rules.get('victory_types')[this.get('type_id')] : null;
    }.property('type_id').cacheable(),
    
    fulfilled: function() {
      return this.get('fulfillmentRatio') > 0.9999;
    }.property('fulfillmentRatio').cacheable(),
    
    fulfillmentRatio: function() {
      if (this.get('type_id') === module.VICTORY_TYPE_DOMINATION) {
        var allRegions = AWE.GS.game.roundInfo.get('regions_count');
        var allianceRegions = this.get('fulfillment_count');
        var reqRegionsRatio = AWE.GS.Util.parseAndEval(this.getPath('victoryType.condition.required_regions_ratio'), AWE.GS.game.roundInfo.get('age'), 'DAYS');
        var fulfillmentRatio = (allianceRegions / allRegions) / reqRegionsRatio;
      }
      else if (this.get('type_id') === module.VICTORY_TYPE_ARTIFACTS) {
        var fulfillmentRatio = this.get('fulfillment_count') / AWE.GS.RulesManager.getRules().artifact_count;
      }
      return (fulfillmentRatio > 0.9999) ? 1 : fulfillmentRatio;
    }.property('alliance_id', 'fulfillment_count', 'AWE.GS.game.roundInfo.regions_count', 'victoryType.condition.required_regions_ratio', 'AWE.GS.game.roundInfo.started_at').cacheable(),
    
    fulfillmentDurationRatio: function() {
      var firstFulfilledAt = this.get('first_fulfilled_at');
      var reqDuration = this.getPath('victoryType.condition.duration');
      if (firstFulfilledAt != null) {
        var duration = (new Date().getTime() - Date.parseISODate(firstFulfilledAt).getTime())/(24 * 3600 * 1000);
        return Math.min(duration / reqDuration, 1);
      }
      else {
        return 0;
      }
    }.property('alliance_id', 'first_fulfilled_at', 'type_id').cacheable(),
    
    daysRemaining: function() {
      var reqDuration = this.getPath('victoryType.condition.duration');
      return Math.max(AWE.UI.Util.round(reqDuration * (1 - this.get('fulfillmentDurationRatio'))), 0);
    }.property('victoryType', 'fulfillmentDurationRatio').cacheable(),
    
    endDate: function() {
      var reqDuration = this.getPath('victoryType.condition.duration');
      var firstFulfilledAt = Date.parseISODate(this.get('first_fulfilled_at')).getTime();
      return new Date(firstFulfilledAt + reqDuration * 24 * 60 * 60 * 1000).toString('dd.MM. HH:mm:ss');
    }.property('first_fulfilled_at').cacheable(),
    
    progressLeaders: function() {
      var self = this;
      var victoryProgressLeaders = AWE.GS.game.get('victoryProgressLeaders');
      var leadersOfThisType = [];
      if (victoryProgressLeaders != null) {
        AWE.Ext.applyFunctionToElements(victoryProgressLeaders, function(leader) {
          if (leader.get('type_id') === self.get('type_id')) {
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
        function(allLeaders, statusCode, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (statusCode === AWE.Net.OK) {
            var leaders = {};
            var rules = AWE.GS.RulesManager.getRules();
            if (rules) {
              rules.get('victory_types').forEach(function(victoryType) {
                var leadersThisType = {};
                AWE.Ext.applyFunctionToElements(allLeaders, function(leader) {
                  if (leader.get('type_id') === victoryType.id) {
                    if (leader.get('pos') === 1) {
                      leadersThisType['first'] = leader;
                    }
                    if (leader.get('pos') === 2) {
                      leadersThisType['second'] = leader;
                    }
                    if (leader.get('pos') === 3) {
                      leadersThisType['third'] = leader;
                    }
                  }
                });
                leaders[victoryType.symbolic_id] = leadersThisType;
              });
              AWE.GS.game.set('victoryProgressLeaders', leaders);
            }
          }
          if (callback) {
            callback(allLeaders, statusCode, xhr, timestamp);
          }
        }
      ); 
    };

    that.updateProgressOfAlliance = function(allianceId, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'alliances/' + allianceId + '/victory_progresses';
      return my.fetchEntitiesFromURL(
        url,                                     // url to fetch from
        my.runningUpdates,                       // queue to register this request during execution
        1,                                       // regionId to fetch -> is used to register the request
        AWE.GS.ENTITY_UPDATE_TYPE_FULL,          // type of update (aggregate, short, full)
        null, // modified after
        function(progresses, statusCode, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
          if (statusCode === AWE.Net.OK) {
            var newProgresses = [];
            AWE.Ext.applyFunctionToElements(progresses, function(progress) {
              newProgresses.push(progress);
            });
            AWE.GS.game.set('victoryProgresses', newProgresses);
          }
          if (callback) {
            callback(progresses, statusCode, xhr, timestamp);
          }
        }
      );
    };

    return that;
      
  }());
    
  return module;
  
}(AWE.GS || {}));


