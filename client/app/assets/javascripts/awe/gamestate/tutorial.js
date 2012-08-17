/* Author: Patrick Fox <patrick@5dlab.com>,
 *         Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.TutorialAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   TUTORIAL
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Tutorial = module.Entity.extend({     // extends Entity to Tutorial
    typeName: 'Tutorial',              ///< identifies instances of this type
      
    version: null,
    quests: null,
		
    questType: function(questId) {
      var quest = this.get('quests')[questId];
      if (quest === undefined || !quest) {
        console.log('ERROR: requested non-existing quest ' + questId);
      }
      return quest;    
    },
       
		extractIds: function(collection) {
		  return collection.getEach('id'); // "getEach" is supplied by ember
		},
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   TUTORIAL MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.TutorialManager = (function(my) {    
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
      
    my.createEntity = function() { return module.Tutorial.create(); }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
      
    that.getTutorial = function() { 
      return that.getEntity(0); 
    };
    
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateTutorial = function(callback) {
      var url = AWE.Config.TUTORIAL_SERVER_BASE + 'tutorial';
      return my.updateEntity(url, 0, module.ENTITY_UPDATE_TYPE_FULL, callback); 
    };
        
    return that;
      
  }());
    
  return module;
  
}(AWE.GS || {}));


