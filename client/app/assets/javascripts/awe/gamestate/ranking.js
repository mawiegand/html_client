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
      var url = AWE.Config.CHARACTER_RANKING_SERVER_BASE;
      return my.fetchEntitiesFromURL(
        url, 
        my.runningUpdatesPerId, 
        1, null, null,
        function(rankingEntries, statusCode, xhr, timestamp) {
          if (statusCode === AWE.Net.OK) {
            AWE.GS.game.set('characterRanking', rankingEntries);
            log('---> set character ranking', rankingEntries);
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


