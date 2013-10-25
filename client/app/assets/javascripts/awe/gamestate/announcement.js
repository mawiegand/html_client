/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.AnnouncementAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   ANNOUNCEMENT
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Announcement = module.Entity.extend({     // extends Entity to Resource Pool
    typeName: 'Announcement',                      ///< identifies instances of this type
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ANNOUNCEMENT MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.AnnouncementManager = (function(my) {    // ResourcePoolManager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastAnnouncementUpdate = null;

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    my.createEntity = function(spec) { return module.Announcement.create(spec); }

    my.queue = {};
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
    
    that.announcement = null;
  
    that.getAnnouncement = function() {
      return this.announcement;
    };
    
    that.lastUpdate = function() {
      return lastAnnouncementUpdate ? lastAnnouncementUpdate : new Date(1970);
    };
  
  
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateAnnouncement = function(updateType, callback) {

      var self = this;
      var characterId = AWE.GS.CharacterManager.getCurrentCharacter().getId();
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'announcements/recent';
      console.log('----> debug', url, AWE.Settings.lang);
      return my.fetchEntitiesFromURL(
        url, 
        my.queue, 
        "recent",
        updateType, 
        my.lastAnnouncementUpdate,
        function(announcement, statusCode, xhr, timestamp) {
          if (statusCode === AWE.Net.OK) {
            self.announcement = announcement;
            my.lastAnnouncementUpdate = timestamp;
          }
          if (callback) {
            callback(announcement, statusCode, xhr, timestamp);
          }
        }
      );
    }
    
    return that;
      
  }());
    
  
  return module;
  
}(AWE.GS || {}));


