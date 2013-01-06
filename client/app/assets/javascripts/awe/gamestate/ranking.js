/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  // ///////////////////////////////////////////////////////////////////////
  //
  //   GENERAL RANKING INFO
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.RankingEntry = module.Entity.extend({
    typeName: 'RankingEntry',
  });     

  module.CharacterRankingEntry = module.RankingEntry.extend({
    typeName: 'CharacterRankingEntry',
    
    ownEntry: function() {
      return AWE.GS.player.currentCharacter.getId() == this.get('character_id');
    }.property('character_id').cacheable(),
  });     
    
  module.AllianceRankingEntry = module.RankingEntry.extend({
    typeName: 'AllianceRankingEntry',
    
    ownEntry: function() {
      return AWE.GS.player.currentCharacter.get('alliance_id') == this.get('alliance_id');
    }.property('character_id').cacheable(),
  });     
    
  module.FortressRankingEntry = module.RankingEntry.extend({
    typeName: 'FortressRankingEntry',
    
    ownEntry: function() {
      return AWE.GS.player.currentCharacter.getId() == this.get('owner_id');
    }.property('character_id').cacheable(),
  });     
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ROUND INFO MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.CharacterRankingEntryManager = (function(my) {
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastCharacterRankingUpdate = null;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.createEntity = function(spec) {
      return module.CharacterRankingEntry.create(spec);
    }
    
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
      
    that.updateCharacterRanking = function(page, sort, callback) {
      var self = this;
      var url = AWE.Config.CHARACTER_RANKING_SERVER_BASE + '?per_page=' + AWE.Config.RANKING_LIST_ENTRIES + '&';

      if (page != null) {
        url += 'page=' + page + '&';
      }
      
      if (sort != null) {
        url += 'sort=' + sort + '&';
      }
      
      return my.fetchEntitiesFromURL(
        url, 
        my.runningUpdatesPerId, 
        1, null, null,
        function(rankingEntries, statusCode, xhr, timestamp) {
          if (statusCode === AWE.Net.OK) {
            AWE.GS.game.set('characterRanking', rankingEntries);
          }
          if (callback) {
            callback(rankingEntries, statusCode, xhr, timestamp);
          }
        }
      );
    }
    
    return that;
      
  }());
    
  module.AllianceRankingEntryManager = (function(my) {
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastAllianceRankingUpdate = null;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.createEntity = function(spec) {
      return module.AllianceRankingEntry.create(spec);
    }
    
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
      
    that.updateAllianceRanking = function(page, sort, callback) {
      var self = this;
      var url = AWE.Config.ALLIANCE_RANKING_SERVER_BASE + '?per_page=' + AWE.Config.RANKING_LIST_ENTRIES + '&';

      if (page != null) {
        url += 'page=' + page + '&';
      }
      
      if (sort != null) {
        url += 'sort=' + sort + '&';
      }
      
      return my.fetchEntitiesFromURL(
        url, 
        my.runningUpdatesPerId, 
        1, null, null,
        function(rankingEntries, statusCode, xhr, timestamp) {
          if (statusCode === AWE.Net.OK) {
            AWE.GS.game.set('allianceRanking', rankingEntries);
          }
          if (callback) {
            callback(rankingEntries, statusCode, xhr, timestamp);
          }
        }
      );
    }
    
    return that;
      
  }());
    
  module.FortressRankingEntryManager = (function(my) {
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastFortressRankingUpdate = null;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.createEntity = function(spec) {
      return module.FortressRankingEntry.create(spec);
    }
    
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
      
    that.updateFortressRanking = function(page, sort, callback) {
      var self = this;
      var url = AWE.Config.FORTRESS_RANKING_SERVER_BASE + '?per_page=' + AWE.Config.RANKING_LIST_ENTRIES + '&';

      if (page != null) {
        url += 'page=' + page + '&';
      }
      
      if (sort != null) {
        url += 'sort=' + sort + '&';
      }
      
      return my.fetchEntitiesFromURL(
        url, 
        my.runningUpdatesPerId, 
        1, null, null,
        function(rankingEntries, statusCode, xhr, timestamp) {
          if (statusCode === AWE.Net.OK) {
            AWE.GS.game.set('fortressRanking', rankingEntries);
          }
          if (callback) {
            callback(rankingEntries, statusCode, xhr, timestamp);
          }
        }
      );
    }
    
    return that;
      
  }());
    
  
  return module;
  
}(AWE.GS || {}));


