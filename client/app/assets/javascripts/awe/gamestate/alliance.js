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
        
    hashableShouts: function() {
      var id = this.get('id');
      return id ? AWE.GS.AllianceShoutAccess.getHashableCollectionForAlliance_id(id) : null;
    }.property('id').cacheable(),  
    
    hashableMembers: function() {
      var id = this.get('id');
      return id ? AWE.GS.CharacterAccess.getHashableCollectionForAlliance_id(id) : null;
    }.property('id').cacheable(),      
    
    members: function() {
      return this.getPath('hashableMembers.collection');
    }.property('hashableMembers.changedAt').cacheable(),
    
    shouts: function() {
      console.log('SHOUTS')
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
      
    my.createEntity = function() { return module.Alliance.create(); }

  
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
    
  
  return module;
  
}(AWE.GS || {}));


