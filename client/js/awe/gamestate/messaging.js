/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

/** GameState Settlement class, manager and helpers. */
AWE.GS = (function(module) {
    
  module.InboxAccess  =      {};
  module.OutboxAccess =      {};
  module.ArchivAccess =      {};

  module.InboxEntryAccess  = {};
  module.OutboxEntryAccess = {};
  module.ArchivEntryAccess = {};

  module.MessageAccess =     {};


  // ///////////////////////////////////////////////////////////////////////
  //
  //   MESSAGE BOXES
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.MessageBox = module.Entity.extend({     // extends Entity to General Message Box
    typeName: 'MessageBox',
    messages_count: null, 

    owner_id: null, old_owner_id: null,
    
    entriesBinding: 'hashableEntries.collection',
  });     

  module.Inbox = module.MessageBox.extend({
    typeName: 'Inbox',
    ownerIdObserver: AWE.Partials.attributeHashObserver(module.InboxAccess, 'owner_id', 'old_owner_id').observes('owner_id'),   
    
    hashableEntries: function() {
      var id = this.get('id');
      return id ? AWE.InboxEntryAccess.getHashableCollectionForInbox_id(id) : null;
    }.property('id').cacheable(),    
  });

  module.Outbox = module.MessageBox.extend({
    typeName: 'Outbox',
    ownerIdObserver: AWE.Partials.attributeHashObserver(module.OutboxAccess, 'owner_id', 'old_owner_id').observes('owner_id'),    
  });

  module.Archiv = module.MessageBox.extend({
    typeName: 'Archiv',
    ownerIdObserver: AWE.Partials.attributeHashObserver(module.ArchivAccess, 'owner_id', 'old_owner_id').observes('owner_id'),    
  });
    

  // ///////////////////////////////////////////////////////////////////////
  //
  //   BOX ENTRIES
  //
  // ///////////////////////////////////////////////////////////////////////     
    
  module.MessageBoxEntry = module.Entity.extend({ 
    typeName:   'MessageBoxEntry',
    message_id: null,
    subject:    null,
    
    message:    null,
    
    fetchMessage: function() {
      AWE.GS.MessageManager.updateMessage(this.get('message_id', module.ENTITY_UPDATE_TYPE_FULL, function (result, status) {
        if (status === AWE.Net.OK) {
          this.set('message', result);
        }
      }));
    },
  });
  
  module.InboxEntry = module.MessageBoxEntry.extend({ 
    typeName: 'InboxEntry',
    sender_id: null,
    inbox_id: null, old_inbox_id: null,
    inboxIdObserver: AWE.Partials.attributeHashObserver(module.InboxEntryAccess, 'inbox_id', 'old_inbox_id').observes('inbox_id'), 
  });
  
  
  // ///////////////////////////////////////////////////////////////////////
  //
  //   MESSAGES
  //
  // /////////////////////////////////////////////////////////////////////// 

  module.Message = module.Entity.extend({ 
    typeName:     'Message',
    recipient_id: null,
    sender_id:    null,
    type_id:      null,
    subject:      null,
    body:         null,
    send_at:      null,
    reported:     null,
    reporter_id:  null,
    flag:         null,
  });  
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   MESSAGE MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  /** basic manager for fetching individual messages. You should not call
   * updateMessage manually, but request the message via a message box 
   * entry. */
  module.MessageManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    my.createEntity = function() { return module.Message.create(); }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getMessage = function(id) {
      return that.getEntity(id);
    }
                
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateMessage = function(id, updateType, callback) {
      var url = AWE.Config.MESSAGING_SERVER_BASE + 'message/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
  
    return that;
      
  }());
  
  
  // ///////////////////////////////////////////////////////////////////////
  //
  //   MESSAGE BOX MANAGERS
  //
  // ///////////////////////////////////////////////////////////////////////  

  /** basic manager for fetching individual messages. You should not call
   * updateMessage manually, but request the message via a message box 
   * entry. */
  module.InboxManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerCharacter = {};///< hash that contains all running requests for alliances, using the alliance.id as key.
    
    my.createEntity = function() { return module.Message.create(); }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);

    that.lastUpdateForCharacter = function(characterId, updateType) {
      return module.InboxAccess.lastUpdateForCharacter_id(characterId, updateType);// modified after
    };
  
    that.getInbox = function(id) {
      return that.getEntity(id);
    }
                
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateInbox = function(id, updateType, callback) {
      var url = AWE.Config.MESSAGING_SERVER_BASE + 'inboxes/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    that.updateInboxOfCharacter = function(characterId, updateType, callback) {
      var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/' + characterId + '/inboxes';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerCharacter,                     // queue to register this request during execution
        characterId,                                       // id to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForCharacter(characterId, updateType),// modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            module.InboxAccess.accessHashForCharacter_id().setLastUpdateAtForValue(characterId, timestamp);
          }
          if (callback) {
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