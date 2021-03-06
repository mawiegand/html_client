/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.InboxAccess  =       {};
  module.OutboxAccess =       {};
  module.ArchiveAccess =      {};

  module.InboxEntryAccess  =  {};
  module.OutboxEntryAccess =  {};
  module.ArchiveEntryAccess = {};

  module.MessageAccess =      {};


  // ///////////////////////////////////////////////////////////////////////
  //
  //   MESSAGE BOXES
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.MessageBox = module.Entity.extend({     // extends Entity to General Message Box
    typeName: 'MessageBox',
    messages_count: null, 

    owner_id: null, old_owner_id: null,
    
    name: 'Message Box',
    
    entryManager: null,    
    entriesBinding: 'hashableEntries.collection',
    
    sortedEntries: function() {
      var messages = this.get('entries');
      return messages ? messages.slice(0).sort(function(a,b) { // why copy (slice)? because the original message array at the collection will be changed outside this method
        return Date.parseISODate(b.get('created_at')).getTime() - Date.parseISODate(a.get('created_at')).getTime();
      }) : null; 
    }.property('entries.length').cacheable(),

    fetchEntries: function() {
      var entryManager = this.get('entryManager');
      if (!entryManager) {
        log('ERROR: Message Box Entry Manager is missing.');
        return ;
      }
      entryManager.updateEntriesOfMessageBox(this.get('id'));
    },
  });

  module.Inbox = module.MessageBox.extend({
    typeName: 'Inbox',
    name: function() {
      return AWE.I18n.lookupTranslation('messaging.inbox');
    }.property('id').cacheable(),
    ownerIdObserver: AWE.Partials.attributeHashObserver(module.InboxAccess, 'owner_id', 'old_owner_id').observes('owner_id'),   
  
    hashableEntries: function() {
      var id = this.get('id');
      return id ? AWE.GS.InboxEntryAccess.getHashableCollectionForInbox_id(id) : null;
    }.property('id').cacheable(),        

    
    init: function(spec) {
      this._super(spec);
      this.set('entryManager', AWE.GS.InboxEntryManager)
    },

  });

  module.Outbox = module.MessageBox.extend({
    typeName: 'Outbox',
    name: function() {
      return AWE.I18n.lookupTranslation('messaging.outbox');
    }.property('id').cacheable(),
    
    ownerIdObserver: AWE.Partials.attributeHashObserver(module.OutboxAccess, 'owner_id', 'old_owner_id').observes('owner_id'),    

    hashableEntries: function() {
      var id = this.get('id');
      return id ? AWE.GS.OutboxEntryAccess.getHashableCollectionForOutbox_id(id) : null;
    }.property('id').cacheable(),        

    init: function(spec) {
      this._super(spec);
      this.set('entryManager', AWE.GS.OutboxEntryManager)
    },

  });

  module.Archive = module.MessageBox.extend({
    typeName: 'Archive',
    name: function() {
      return AWE.I18n.lookupTranslation('messaging.archive');
    }.property('id').cacheable(),

    ownerIdObserver: AWE.Partials.attributeHashObserver(module.ArchiveAccess, 'owner_id', 'old_owner_id').observes('owner_id'),

    hashableEntries: function() {
      var id = this.get('id');
      return id ? AWE.GS.ArchiveEntryAccess.getHashableCollectionForArchive_id(id) : null;
    }.property('id').cacheable(),  

    init: function(spec) {
      this._super(spec);
      this.set('entryManager', AWE.GS.ArchiveEntryManager)
    },

  });
    

  // ///////////////////////////////////////////////////////////////////////
  //
  //   BOX ENTRIES
  //
  // ///////////////////////////////////////////////////////////////////////     
    
  module.MessageBoxEntry = module.Entity.extend({ 
    typeName:    'MessageBoxEntry',
    owner_id:    null,
    message_id:  null,
    subject:     null,
    
    message:     null,
    
    fetchMessage: function() {
      var self = this;
      var messageId = this.get('message_id');
      var message = AWE.GS.MessageManager.getMessage(messageId);
      
      if (message) {
        this.set('message', message);
      }
      else {
        AWE.GS.MessageManager.updateMessage(messageId, module.ENTITY_UPDATE_TYPE_FULL, function (result, status) {
          if (status === AWE.Net.OK) {
            self.set('message', result);
          }
        });
      }
    },
    
    /** counterpart to fetchMessage - removes the message in case it was destroyed. */
    messageObserver: function() {
      if (this.get('message') && this.get('message').get('isDestroyed')) {
        this.set('message', null);
      }
    }.observes('message.isDestroyed'),
    
  });
  
  module.InboxEntry = module.MessageBoxEntry.extend({ 
    typeName: 'InboxEntry',
    sender_id: null,
    inbox_id: null, old_inbox_id: null,
    inboxIdObserver: AWE.Partials.attributeHashObserver(module.InboxEntryAccess, 'inbox_id', 'old_inbox_id').observes('inbox_id'), 
 
    read: false,
    unreadBinding: Ember.Binding.not('read'),
 
    sender: null,
 
    updateSender: function() {
      var self = this;
      var senderId = this.get('sender_id');
      var sender = AWE.GS.CharacterManager.getCharacter(senderId) || null;
      this.set('sender', sender); 
      if (!sender) {
        AWE.GS.CharacterManager.updateCharacter(senderId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          if (character) {
            self.set('sender', character);
          }
        });
      }
    }.observes('sender_id'),
  });
  

  module.OutboxEntry = module.MessageBoxEntry.extend({ 
    typeName: 'OutboxEntry',
    recipient_id: null,
    outbox_id: null, old_outbox_id: null,
    outboxIdObserver: AWE.Partials.attributeHashObserver(module.OutboxEntryAccess, 'outbox_id', 'old_outbox_id').observes('outbox_id'), 
 
    recipient: null,
 
    updateRecipient: function() {
      var self = this;
      var recipientId = this.get('recipient_id');
      var recipient = AWE.GS.CharacterManager.getCharacter(recipientId) || null;
      this.set('recipient', recipient); 
      if (!recipient) {
        AWE.GS.CharacterManager.updateCharacter(recipientId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          if (character) {
            self.set('recipient', character);
          }
        });
      }
    }.observes('recipient_id'),
  });
  
  
  module.ArchiveEntry = module.MessageBoxEntry.extend({ 
    typeName: 'ArchiveEntry',

    archive_id: null, old_archive_id: null,
    archiveIdObserver: AWE.Partials.attributeHashObserver(module.ArchiveEntryAccess, 'archive_id', 'old_archive_id').observes('archive_id'),

    sender: null,
    recipient: null,

    type_id: null,

    isSentEntry: function() {
      return this.get('type_id') === 0;
    }.property('type_id').cacheable(),

    updateSender: function() {
      var self = this;
      var senderId = this.get('sender_id');
      var sender = AWE.GS.CharacterManager.getCharacter(senderId) || null;
      this.set('sender', sender);
      if (sender == null && senderId != null) {
        AWE.GS.CharacterManager.updateCharacter(senderId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          if (character) {
            self.set('sender', character);
          }
        });
      }
    }.observes('sender_id'),

    updateRecipient: function() {
      var self = this;
      var recipientId = this.get('recipient_id');
      var recipient = AWE.GS.CharacterManager.getCharacter(recipientId) || null;
      this.set('recipient', recipient);
      if (recipient == null && recipientId != null) {
        AWE.GS.CharacterManager.updateCharacter(recipientId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          if (character) {
            self.set('receiver', character);
          }
        });
      }
    }.observes('recipient_id'),
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
    
    sender:       null,  ///< will be automatically connected to character
    recipient:    null,  ///< will be automatically connected to character   
 
    /** automatically fetch and set sender to sending character. */
    updateSender: function() {
      var self = this;
      var senderId = this.get('sender_id');
      if (!senderId) {  // system message
        return ;
      }
      var sender = AWE.GS.CharacterManager.getCharacter(senderId) || null;
      this.set('sender', sender); 
      if (!sender) {
        AWE.GS.CharacterManager.updateCharacter(senderId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          if (character) {
            self.set('sender', character);
          }
        });
      }
    }.observes('sender_id'),
    
    /** automatically fetch and set recipient to receiving character. */
    updateRecipient: function() {
      var self = this;
      var recipientId = this.get('recipient_id');
      var recipient = AWE.GS.CharacterManager.getCharacter(recipientId) || null;
      if (!recipientId) { // round-message
        return ;
      }
      this.set('recipient', recipient); 
      if (!recipient) {
        AWE.GS.CharacterManager.updateCharacter(recipientId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          if (character) {
            self.set('recipient', character);
          }
        });
      }
    }.observes('recipient_id'),
    
    isSystemMessage: function() {
      var typeId = this.get('type_id');
      return typeId !== null && typeId !== undefined && typeId !== 0 && typeId !== 13 && typeId !== 12;
    }.property('type_id'),
    
    isAllianceMessage: function() {
      return (this.get('type_id') || 0) === 13; // TODO : DEFINE CONSTANT
    }.property('type_id'),
    
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
      var url = AWE.Config.MESSAGING_SERVER_BASE + 'messages/'+id;
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
  module.createMessageBoxManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
          
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);

    that.typeName = "MessageBoxManager";

    that.getMessageBox = function(id) {
      return that.getEntity(id);
    }
                
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateMessageBox = function(id, updateType, callback) {
      var url = my.boxURL + id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    that.updateMessageBoxOfCharacter = function(characterId, updateType, callback) {
      var url = my.characterBoxesURL + characterId + my.boxFragementURL;

      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerCharacter,                     // queue to register this request during execution
        characterId,                                       // id to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForCharacter(characterId, updateType),// modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            that.setLastUpdateForCharacter(characterId, timestamp.add(-1).second());
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
      
  });


  /** basic manager for fetching individual messages. You should not call
   * updateMessage manually, but request the message via a message box 
   * entry. */
  module.InboxManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerCharacter = {};///< hash that contains all running requests for alliances, using the alliance.id as key.

    my.boxURL            = AWE.Config.MESSAGING_SERVER_BASE   + 'inboxes/';
    my.characterBoxesURL = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/';
    my.boxFragementURL   = '/inboxes';

    my.createEntity = function() { return module.Inbox.create(); }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createMessageBoxManager(my);

    that.lastUpdateForCharacter = function(characterId, updateType) {
      return module.InboxAccess.lastUpdateForOwner_id(characterId, updateType);// modified after
    };
  
    that.setLastUpdateForCharacter = function(characterId, timestamp) {
      module.InboxAccess.accessHashForOwner_id().setLastUpdateAtForValue(characterId, timestamp);
    };
    
    that.triggerInboxAutoUpdate = function(forceNow) {
      forceNow = forceNow || false;
      var character = AWE.GS.CharacterManager.getCurrentCharacter();
      if (!character) return ;
      
      var inbox = character.get('inbox');
      
      if (!inbox) {
        character.fetchInbox(function(inboxes, status) {
          if (status === AWE.Net.NOT_FOUND || !inboxes) {
            log('ERROR: inbox of current character not found on server.');
          } 
          else { 
            inbox = AWE.GS.CharacterManager.getCurrentCharacter().get('inbox');
            if (inbox) {
              inbox.fetchEntries();
            }
            else {
              log('ERROR: inbox could not be fetched from server.');
            }
          }
        });
      }
      else if (inbox && (forceNow || inbox.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 10000 <  AWE.GS.TimeManager.estimatedServerTime().getTime())) { // timeout
        AWE.GS.InboxManager.updateMessageBox(inbox.get('id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(inbox, status) {
					if (inbox && inbox.getId() && status !== AWE.Net.NOT_MODIFIED) {
            inbox.fetchEntries()
					}
        });
      }
    };
  
    return that;
      
  }());
  
  
  /** basic manager for fetching individual messages. You should not call
   * updateMessage manually, but request the message via a message box 
   * entry. */
  module.OutboxManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerCharacter = {};///< hash that contains all running requests for alliances, using the alliance.id as key.
    my.boxURL            = AWE.Config.MESSAGING_SERVER_BASE   + 'outboxes/';
    my.characterBoxesURL = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/';
    my.boxFragementURL   = '/outboxes';

    my.createEntity = function() { return module.Outbox.create(); }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createMessageBoxManager(my);

    that.lastUpdateForCharacter = function(characterId, updateType) {
      return module.OutboxAccess.lastUpdateForOwner_id(characterId, updateType);// modified after
    };
  
    that.setLastUpdateForCharacter = function(characterId, timestamp) {
      module.OutboxAccess.accessHashForOwner_id().setLastUpdateAtForValue(characterId, timestamp);
    };
  
    return that;
      
  }());
  
  /** basic manager for fetching individual messages. You should not call
   * updateMessage manually, but request the message via a message box 
   * entry. */
  module.ArchiveManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.runningUpdatesPerCharacter = {};///< hash that contains all running requests for alliances, using the alliance.id as key.
    my.boxURL            = AWE.Config.MESSAGING_SERVER_BASE   + 'archives/';
    my.characterBoxesURL = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/';
    my.boxFragementURL   = '/archives';

    my.createEntity = function() { return module.Archive.create(); }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createMessageBoxManager(my);

    that.lastUpdateForCharacter = function(characterId, updateType) {
      return module.ArchiveAccess.lastUpdateForOwner_id(characterId, updateType);// modified after
    };
  
    that.setLastUpdateForCharacter = function(characterId, timestamp) {
      module.ArchiveAccess.accessHashForOwner_id().setLastUpdateAtForValue(characterId, timestamp);
    };
  
    return that;
      
  }());
    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   MESSAGE BOX ENTRY MANAGERS
  //
  // ///////////////////////////////////////////////////////////////////////  

  /** basic manager for fetching message box entries. You should not call
   * updateEntriesForMessageBox manually, but request the entries via a 
   * message box using e.g. "inbox.fetchEntries()". */
  module.createMessageBoxEntryManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    my.runningUpdatesPerMessageBox = {};///< hash that contains all running requests for alliances, using the alliance.id as key.
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);

    that.typeName = "MessageBoxEntryManager";
  
    that.getEntry = function(id) {
      return that.getEntity(id);
    }
                
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     * Usually, this method is not needed, since entries do not change 
     * (perhaps it'll be needed later for deleting entries on a 404).
     */
    that.updateEntry = function(id, updateType, callback) {
      var url = my.entriesURL + id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    that.updateEntriesOfMessageBox = function(messageBoxId, updateType, callback) {
      var url = my.boxEntriesURL + messageBoxId + '/entries';
      return my.fetchEntitiesFromURL(
        url,                                               // url to fetch from
        my.runningUpdatesPerMessageBox,                    // queue to register this request during execution
        messageBoxId,                                      // id to fetch -> is used to register the request
        updateType,                                        // type of update (aggregate, short, full)
        this.lastUpdateForMessageBox(messageBoxId, updateType),// modified after
        function(result, status, xhr, timestamp)  {        // wrap handler in order to set the lastUpdate timestamp
          if (status === AWE.Net.OK || status === AWE.Net.NOT_MODIFIED) {
            that.setLastUpdateForMessageBox(messageBoxId, timestamp.add(-1).second());
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
      
  });

  /** basic manager for fetching individual messages. You should not call
   * updateMessage manually, but request the message via a message box 
   * entry. */
  module.InboxEntryManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.createEntity = function() { return module.InboxEntry.create(); }
    my.boxEntriesURL = AWE.Config.MESSAGING_SERVER_BASE + 'inboxes/';
    my.entriesURL    = AWE.Config.MESSAGING_SERVER_BASE + 'inbox_entries/';
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createMessageBoxEntryManager(my);

    that.lastUpdateForMessageBox = function(inboxId, updateType) {
      return module.InboxEntryAccess.lastUpdateForInbox_id(inboxId, updateType);// modified after
    };
    
    that.setLastUpdateForMessageBox = function(inboxId, timestamp) {
      module.InboxEntryAccess.accessHashForInbox_id().setLastUpdateAtForValue(inboxId, timestamp);
    };

    return that;
  
  }());
  
  
  /** basic manager for fetching individual messages. You should not call
   * updateMessage manually, but request the message via a message box 
   * entry. */
  module.OutboxEntryManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.createEntity = function() { return module.OutboxEntry.create(); }
    my.boxEntriesURL = AWE.Config.MESSAGING_SERVER_BASE + 'outboxes/';
    my.entriesURL    = AWE.Config.MESSAGING_SERVER_BASE + 'outbox_entries/';
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createMessageBoxEntryManager(my);

    that.lastUpdateForMessageBox = function(outboxId, updateType) {
      return module.OutboxEntryAccess.lastUpdateForOutbox_id(outboxId, updateType);// modified after
    };
    
    that.setLastUpdateForMessageBox = function(outboxId, timestamp) {
      module.OutboxEntryAccess.accessHashForOutbox_id().setLastUpdateAtForValue(outboxId, timestamp);
    };

    return that;
  
  }());
  
  /** basic manager for fetching individual messages. You should not call
   * updateMessage manually, but request the message via a message box 
   * entry. */
  module.ArchiveEntryManager = (function(my) {   
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    
    // protected attributes and methods ////////////////////////////////////

    my = my || {};
    
    my.createEntity = function() { return module.ArchiveEntry.create(); }
    my.boxEntriesURL = AWE.Config.MESSAGING_SERVER_BASE + 'archives/';
    my.entriesURL    = AWE.Config.MESSAGING_SERVER_BASE + 'archive_entries/';
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createMessageBoxEntryManager(my);

    that.lastUpdateForMessageBox = function(archiveId, updateType) {
      return module.ArchiveEntryAccess.lastUpdateForArchive_id(archiveId, updateType);// modified after
    };
    
    that.setLastUpdateForMessageBox = function(archiveId, timestamp) {
      module.ArchiveEntryAccess.accessHashForArchive_id().setLastUpdateAtForValue(archiveId, timestamp);
    };

    return that;
  
  }());  
  
  return module;
  
}(AWE.GS || {}));