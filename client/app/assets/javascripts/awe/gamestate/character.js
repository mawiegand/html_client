/* Author: Sascha Lange <sascha@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
  
  module.player = Ember.Object.create({
    currentCharacter: null,
  });
    
  module.CharacterAccess = {};
  module.rightOfWayTypes = [ 'all', 'noEnemies', 'noNeutrals', 'noResidents'];

  // ///////////////////////////////////////////////////////////////////////
  //
  //   CHARACTER
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Character = module.Entity.extend({     // extends Entity to Army
    typeName: 'Character',          ///< identifies instances of this type
    identifier: null,               ///< unique identifier assigned by identity_provider
    premium_account: false,         ///< whether this account presently is a premium account
    name: null,                     ///< name of the character

    lvel: null,                    ///< level of the character. can be increased by gaining further experience
    exp: null,                      ///< experience of the character
    att: null,                      ///< attack ability of character
    def: null,                      ///< defense ability of character
    skill_points: null,             ///< number of unassigned skill points
    
    wins: null,                     ///< number of fights / duels won
    losses: null,                   ///< numebr of fights / duels lost
    
    health_max: null,               ///< maximum health of character
    health_present: null,           ///< present health 
    health_updated_at: null,        ///< last health update; interpolate present heahlt from here
    
    locked: false,                  ///< TODO: don't communicate this!
    locked_by: null,
    locked_at: null,
        
    alliance_id: null, old_alliance_id: null, ///< id of the alliance the character is a member of
    allianceIdObserver: AWE.Partials.attributeHashObserver(module.CharacterAccess, 'alliance_id', 'old_alliance_id').observes('alliance_id'),
    alliance_tag: null,
    
    base_location_id: null,         ///< the location id, where this character has its home base
    base_region_id: null,           ///< the region id, where this charachter has its home base
    base_node_id: null,
    
    base_node: null,                ///< holds the base node. TODO: should hold a reference to the node in the tree
    
    creditAmount: 0,                ///< credit amount of character
    
    frog_amount: 0,
    premium_expiration: null,
    
    resourcePool: null,

    
    //
    // //// MESSAGING //////////////////////////////////////////////////////// 
    //
    
    hashableInboxes: function() {
      var id = this.get('id');
      return id ? AWE.GS.InboxAccess.getHashableCollectionForOwner_id(id) : null;
    }.property('id').cacheable(),  
    
    hashableOutboxes: function() {
      var id = this.get('id');
      return id ? AWE.GS.OutboxAccess.getHashableCollectionForOwner_id(id) : null;
    }.property('id').cacheable(),
    
    hashableArchives: function() {
      var id = this.get('id');
      return id ? AWE.GS.ArchiveAccess.getHashableCollectionForOwner_id(id) : null;
    }.property('id').cacheable(),    
    
    inbox: function() {
      var hashableInboxes = this.get('hashableInboxes');
      if (hashableInboxes && hashableInboxes.get('collection') && hashableInboxes.get('collection').length === 1) {
        return hashableInboxes.get('collection')[0];
      }
      return null;
    }.property('hashableInboxes.changedAt').cacheable(),
    
    outbox: function() {
      var hashableOutboxes = this.get('hashableOutboxes');
      if (hashableOutboxes && hashableOutboxes.get('collection') && hashableOutboxes.get('collection').length === 1) {
        return hashableOutboxes.get('collection')[0];
      }
      return null;
    }.property('hashableOutboxes.changedAt').cacheable(),
    
    archive: function() {
      var hashableArchives = this.get('hashableArchives');
      if (hashableArchives && hashableArchives.get('collection') && hashableArchives.get('collection').length === 1) {
        return hashableArchives.get('collection')[0];
      }
      return null;
    }.property('hashableArchives.changedAt').cacheable(),
    
    fetchInbox: function(callback) {
      AWE.GS.InboxManager.updateMessageBoxOfCharacter(this.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, callback);
    },
    
    fetchOutbox: function(callback) {
      AWE.GS.OutboxManager.updateMessageBoxOfCharacter(this.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, callback);
    },
    
    fetchArchive: function(callback) {
      AWE.GS.ArchiveManager.updateMessageBoxOfCharacter(this.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, callback);
    },

    // ////////////////////////////////////////////////////////////////// ////
    
    
    isEnemyOf: function(opponent) {
      return !this.isNeutral() && !opponent.isNeutral() && this.get('alliance_id') != opponent.get('alliance_id');
    },
    
    isNeutral: function() {
      return this.get('alliance_id') === null;
    },
    
    livesInRegion: function(region) {
      var locations = region.locations();
      
      if (locations) {
        for (var key in locations) {
          if (locations.hasOwnProperty(key) && locations[key].ownerId() === this.get('owner_id')) {
            return true;
          }
        }
      }
      else {
        AWE.Map.Manager.fetchLocationsForRegion(armyRegion);     // callback fuer model wechsel?     
      }
      
      return false;
    },

    rightOfWayAt: function(location) {
      
      var locationOwner = AWE.GS.CharacterManager.getCharacter(location.ownerId());
      
      if (locationOwner) {
        
        var rightOfWay = location.rightOfWay();
        log('type? ', module.rightOfWayTypes[rightOfWay]);
        
        if (module.rightOfWayTypes[rightOfWay] == 'all') {
          return true;
        }
        else if (module.rightOfWayTypes[rightOfWay] == 'noEnemies') {
          return !this.isEnemyOf(locationOwner);
        } 
        else if (module.rightOfWayTypes[rightOfWay] == 'noNeutrals') {
          return !this.isEnemyOf(locationOwner)
                 && !this.isNeutral();
        }
        else if (module.rightOfWayTypes[rightOfWay] == 'noResidents') {
          return !this.isEnemyOf(locationOwner)
                 && !this.isNeutral()
                 && this.livesInRegion(location.region());
        }
        else {
          return false;         
        }
      }
      else {
        return 'loading';
      }
    }
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   CHARACTER MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.CharacterManager = (function(my) {    // CharacterManager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastCurrentCharacterUpdate = null;
    var currentCharacter = null;  // THIS IS TO GO AWAY, WE NEED A PROPERTY WE CAN BIND TO!
    

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.runningUpdatesPerAllicance = {};  ///< hash that contains all running requests for alliances, using the alliance.id as key.
    my.runningUpdatesPerId = {};         ///< hash that contains all running requests for characters, using the id as key.
    
    my.createEntity = function(spec) { return module.Character.create(spec); }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
      
    that.getCharacter = function(id) {
      return that.getEntity(id);
    };
    
    that.getCurrentCharacter = function() {
      return module.player.get('currentCharacter');
    };
    
    that.getMembersOfAlliance = function(id) { 
      return AWE.GS.CharacterAccess.getAllForAlliance_id(id)
    };
    
    that.lastUpdateAtForAllianceId = function(allianceId, updateType) {
      return module.CharacterAccess.lastUpdateForAlliance_id(allianceId, updateType);// modified after
    };
    
    that.lastUpdateForCurrentCharacter = function() {
      return lastCurrentCharacterUpdate ? lastCurrentCharacterUpdate : new Date(1970);
    };
  

  
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateCharacter = function(id, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE+'characters/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
  
    /** updates all characters in a given alliance. Calls the callback with a
     * list of all the updated characters. */
    that.updateMembersOfAlliance = function(allianceId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE+'alliances/'+allianceId+'/characters';
      return my.fetchEntitiesFromURL(
        url,                                  // url to fetch from
        my.runningUpdatesPerAllicance,        // queue to register this request during execution
        allianceId,                           // regionId to fetch -> is used to register the request
        updateType,                           // type of update (aggregate, short, full)
        module.CharacterAccess.lastUpdateForAlliance_id(allianceId), // modified after
        function(result, status, xhr, timestamp)  {   // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.CharacterAccess.accessHashForAlliance_id().setLastUpdateAtForValue(allianceId, timestamp.add(-1).second());
          }
          if (callback) {
            if (status === AWE.Net.NOT_MODIFIED) {
              result = module.CharacterAccess.getAllForAlliance_id(allianceId);
            }
            callback(result, status, xhr, timestamp);
          }
        }
      ); 
    }
    
    that.updateCurrentCharacter = function(updateType, callback) {
      var self = this;
      var currentCharacter = module.player.get('currentCharacter');
      if (currentCharacter !== undefined && currentCharacter !== null) {
        return this.updateCharacter(currentCharacter.get('id'), updateType, callback);
      }
      else { // no current character, need to fetch self
        var url = AWE.Config.FUNDAMENTAL_SERVER_BASE+'characters/self';
        return my.fetchEntitiesFromURL(
          url, 
          my.runningUpdatesPerId, 
          'self', 
          updateType, 
          null,
          function(character, statusCode, xhr, timestamp) {
            if (statusCode === AWE.Net.OK) {
              module.player.set('currentCharacter', character);
              self.currentCharacter = character; 
            }
            if (callback) {
              callback(character, statusCode, xhr, timestamp);
            }
          }
        );
      }        
    }
    
    return that;
      
  }());
    
  
  return module;
  
}(AWE.GS || {}));

