/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ROUND INFO
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.RoundInfo = module.Entity.extend({
    typeName: 'RoundInfo',
    
    name: null,
    started_at: null,
    regions_count: null,    
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ROUND INFO MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.RoundInfoManager = (function(my) {
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastRoundInfoUpdate = null;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.createEntity = function(spec) { return module.RoundInfo.create(spec); }

    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
      
    that.lastUpdateForGameInfo = function() {
      return lastRoundInfoUpdate ? lastRoundInfoUpdate : new Date(1970);
    };
  
    that.updateRoundInfo = function(updateType, callback) {
      var self = this;
      var roundInfo = module.game.get('roundInfo');
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


