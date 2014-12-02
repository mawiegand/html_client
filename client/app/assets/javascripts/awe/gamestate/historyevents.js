/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
    
  module.HistoryEventAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT
  //
  // ///////////////////////////////////////////////////////////////////////    
   
  /** 
   * Class for holding the state of a settlement. 
   *
   * @class
   * @extends AWE.GS.Entity
   * @name AWE.GS.Settlement */ 
  module.HistoryEvent = module.Entity.extend( /** @lends AWE.GS.Settlement# */ {    
    typeName: 'HistoryEvent',

    character_id: null,
    old_character_id: null,
    characterIdObserver: AWE.Partials.attributeHashObserver(module.HistoryEventAccess, 'character_id', 'old_character_id').observes('character_id'),
    
    data: null,
    
    localized_description: null,
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   SETTLEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.HistoryEventManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastCharacterUpdates = {};
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerCharacter = {};
  
    my.createEntity = function() {
      return module.HistoryEvent.create();
    }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getHistoryEvent = function(id) {
      return that.getEntity(id);
    }
        
    that.getHistoryEventsOfCharacter = function(characterId) {
      return AWE.GS.HistoryEventAccess.getEnumerableForCharacter_id(characterId);
    }
    
    that.lastUpdateForCharacter = function(characterId) {
      if (lastCharacterUpdates[characterId]) {
        return lastCharacterUpdates[characterId];
      }
      else {
        return new Date(1970);
      }
    }
     
    /** updates all settlements for the current character. Calls the callback with a
     * list of all the updated settlements. */
    that.updateOwnHistoryEvents = function(updateType, callback) {
      var characterId = AWE.GS.CharacterManager.getCurrentCharacter().getId();
      that.updateHistoryEventsOfCharacter(characterId, updateType, callback);
    }

    /** updates all settlements for a given character. Calls the callback with a
     * list of all the updated settlements. */
    that.updateHistoryEventsOfCharacter = function(characterId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/' + characterId + '/history_events';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerCharacter,                     // queue to register this request during execution
        characterId,                                       // regionId to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForCharacter(characterId),          // modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            lastCharacterUpdates[characterId] = timestamp;
          }
          if (callback) {debugger
            if (status === AWE.Net.NOT_MODIFIED) {
              result = that.getEntities();
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