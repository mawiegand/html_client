/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {}; 

AWE.UI.Ember = (function(module) {

  /** bound to a property, either displays the properties's value, or - if
   * the value is not set (=== null) - a spinning wheel. Can be easily 
   * integrated into any ember view. 
   *
   * Example:
   *  {{view AWE.WheelOrValueView valueBinding="my.value"}}
   */ 
  module.WheelOrValueView = Ember.View.extend({
    templateName: 'wheel-or-value',
    tagName: 'span',
    value: null,
    nullValue: function() {
      return this.get('value') === null || typeof this.get('value') === "undefined"; 
    }.property('value').cacheable(),
  });

  module.MessageView = Ember.View.extend({
    templateName: 'message',
    
    timeString: function() {
      return AWE.Util.localizedDateTime(this.getPath('message.created_at'));
    }.property('message.created_at').cacheable(),
  });
  
  
  module.NewMessageView = Ember.View.extend({
    tagName:      'form',
    templateName: 'message-edit',

    didInsertElement: function() {
      this._super();
      this.$('input:first').focus();
    },
    
    cancelForm: function() {
      this.getPath("parentView.controller").discardDraft();
    },
    
    submit: function(event) {
      this.getPath("parentView.controller").sendMessage(this.get('message'));
    },
  });
  
  /** brief overview about a message that is used in the message-list bar
   * in the left column of the message center. */
  module.MessageTeaserView = Ember.View.extend({
    templateName: 'message-teaser',

    timeString: function() {
      return AWE.Util.createTimeString(this.getPath('message.created_at'));
    }.property('message.created_at').cacheable(),
    
    /** computed property used for marking the message that has been selected
     * by the user. */
    selected: function() {
      var parentView = this.get('parentView');
      return parentView && parentView.get('isFormVisible') === false && parentView.get('selectedMessageEntry') === this.get('message');
    }.property('parentView.selectedMessageEntry', 'parentView.isFormVisible').cacheable(),
    
    /** reacts to clicks on a message by making it the selected message. */
    click: function(event) {
      var messageEntry = this.get('message');
      this.get('parentView').hideForm(); // make sure, form is hidden
      this.get('parentView').set('selectedMessageEntry', messageEntry);
      
      log ("TEASER CLICKED", messageEntry, messageEntry.get('message'), messageEntry.get('message') ? messageEntry.get('message').get('isDestroyed') : null);
      
      if (messageEntry && !messageEntry.get('message')) {
        messageEntry.fetchMessage();
      }
    },     
  });
  
  module.DraftTeaserView = Ember.View.extend({
    templateName: 'message-draft-teaser',

    /** computed property used for marking the message that has been selected
     * by the user. */
    selectedBinding: 'parentView.isFormVisible',
    
    /** reacts to clicks on a message by making it the selected message. */
    click: function(event) {
      this.getPath('parentView').showForm();
    },
  });  
  
  module.NewMessage = Ember.View.extend({
    sender_id: null,
    recipient: null,
    alliance:  null,
    subject:   null,
    body:      null,

    oldRecipient:     null,    
    recipientUnknown: false,
    
    recipientObserver: function() {
      if (this.get('oldRecipient') !== this.get('recipient')) {
        this.set('recipientUnknown', false);
        this.set('oldRecipient', this.get('recipient'));
      }
    }.observes('recipient'),
    
  });
  
  module.MessageCenterView = Ember.View.extend({
    templateName: 'message-center',
    
    character: null,
    alliance: null,
    
    inboxBinding: "character.inbox",
    outboxBinding: "character.outbox",
    archiveBinding: "character.archive",
    
    newMessage: null,
    
    selectedMessageEntry: null,
    selectedMessageBinding: 'selectedMessageEntry.message',
    
    display: 'inbox',
    
    isFormVisible: false,
    
    showForm: function(alliance) {
      if (!this.get('newMessage')) {
        this.set('newMessage', module.NewMessage.create({
          sender_id: AWE.GS.CharacterManager.getCurrentCharacter().get('id'),
          alliance:  alliance || null
        }));
      }
      this.set('isFormVisible', true);
    },

    showAllianceMessageForm: function() {
      var alliance = this.get('alliance');
      if (alliance) {
        this.showForm(alliance);
      }
      else {
        log('could not create alliance message, because character seems to be in no alliance.');
      }
    },
    
    hideForm: function() {
      this.set('isFormVisible', false);
    },
    
    messageBox: function() {
      var display = this.get('display');
      if (display === 'archive') {
        return this.get('archive');
      }
      else if (display === 'outbox') {
        return this.get('outbox');
      }
      else {
        return this.get('inbox');
      }
    }.property('display', 'inbox', 'outbox', 'archive').cacheable(),

    
    displayingInbox: function() {
      return this.get('display') === 'inbox';
    }.property('display').cacheable(),
    
    displayingOutbox: function() {
      return this.get('display') === 'outbox';
    }.property('display').cacheable(),

    displayingArchive: function() {
      return this.get('display') === 'archive';
    }.property('display').cacheable(),
    
    switchTo: function(box) {
      var atPresent = this.get('display');
      if (atPresent !== box) {
        this.set('display', box);
        this.set('selectedMessageEntry', null);
      }
    },
    
    isArchivingVisible: function() {
      return this.getPath('character.isPlatinumActive') && (this.get('displayingInbox') || this.get('displayingOutbox'));
    }.property('selectedMessage', 'displayingInbox', 'displayingOutbox'),

    isForwardPossible: function() {
      return !this.get('newMessage') && this.getPath('selectedMessage');
    }.property('selectedMessage', 'newMessage'),

    isReplyPossible: function() {
      return !this.get('newMessage') && this.getPath('selectedMessage.sender.name');
    }.property('selectedMessage', 'selectedMessage.sender.name', 'newMessage'),

    isDeletePossible: function() {
      return !this.get('newMessage') && this.get('selectedMessage');
    }.property('selectedMessage', 'newMessage'),

    isArchivingPossible: function() {
      return !this.get('newMessage') && this.get('selectedMessage');
    }.property('selectedMessage', 'newMessage'),

    isAllianceMessagePossible: function() {
      var characterId = this.getPath('character.id');
      var leaderId    = this.getPath('alliance.leader_id');
      log('IS POSSIBLE ALLY MESSAGE', characterId, leaderId);
      return characterId && characterId === leaderId;
    }.property('character', 'alliance.leader_id'),
    
    replyClicked: function() {
      this.set('newMessage', module.NewMessage.create({
        recipient: this.getPath('selectedMessage.sender.name'),  
        subject:   'Re: ' + (this.getPath('selectedMessage.subject') || ''),
        body:      ' \n\n\n---- On  ' + AWE.Util.localizedDateTime(this.getPath('selectedMessage.created_at')) + ' ' +
                    (this.getPath('selectedMessage.sender.name') || 'someone') + ' wrote:\n\n' +
                    AWE.Util.htmlToAscii(this.getPath('selectedMessage.body')),
        sender_id: AWE.GS.CharacterManager.getCurrentCharacter().get('id'),
      }));
      this.showForm();
    },

    forwardClicked: function() {
      this.set('newMessage', module.NewMessage.create({
        subject:   'Fwd: ' + (this.getPath('selectedMessage.subject') || ''),
        body:      ' \n\n\n---- On  ' + AWE.Util.localizedDateTime(this.getPath('selectedMessage.created_at')) + ' ' +
                    (this.getPath('selectedMessage.sender.name') || 'Sytem') + ' wrote to ' +
                    this.getPath('selectedMessage.recipient.name') + ':\n\n' +
                    AWE.Util.htmlToAscii(this.getPath('selectedMessage.body')),
        sender_id: AWE.GS.CharacterManager.getCurrentCharacter().get('id'),
      }));
      this.showForm();
    },
    
    deleteClicked: function() {
      var selectedMessageEntry = this.get('selectedMessageEntry');
      if (!selectedMessageEntry) {
        log('ERROR: could not delete message.');
        return ;
      }

      var position = null;
      var messageEntries = this.getPath('messageBox.sortedEntries');

      messageEntries.find(function(entry, index) {
        if (entry == selectedMessageEntry) {
          position = index + 1;
          return true;
        }
        else return false;
      }, selectedMessageEntry);

      var self = this;

      AWE.Action.Messaging.createDeleteMessageAction(selectedMessageEntry).send(function() {
        self.set('selectedMessageEntry', null);
        if (messageEntries != null && messageEntries.length > position && messageEntries[position] != null) {
          self.set('selectedMessageEntry', messageEntries[position]);
          if (!messageEntries[position].get('message')) {
            messageEntries[position].fetchMessage();
          }
        }
      });
    },
    
    archivingClicked: function() {
      var selectedMessageEntry = this.get('selectedMessageEntry');
      var position = null;
      var messageEntries = this.getPath('messageBox.sortedEntries');

      messageEntries.find(function(entry, index) {
        if (entry == selectedMessageEntry) {
          position = index + 1;
          return true;
        }
        else return false;
      }, selectedMessageEntry);

      var self = this;

      AWE.Action.Messaging.createMoveToArchiveMessageAction(selectedMessageEntry).send(function() {
        self.set('selectedMessageEntry', null);
        if (messageEntries != null && messageEntries.length > position && messageEntries[position] != null) {
          self.set('selectedMessageEntry', messageEntries[position]);
          if (!messageEntries[position].get('message')) {
            messageEntries[position].fetchMessage();
          }
        }
      });
    },

    markRead: function(inboxEntry) {
      var selectedMessageEntry = this.get('selectedMessageEntry');
      if (!inboxEntry || inboxEntry.get('read')) {  // already marked as read?
        return ;
      }
      AWE.Action.Messaging.createMarkMessageReadAction(inboxEntry).send();

      // Tutorial Hook
      AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_message');
    },
    
    messageReadMarker: function() {
      var selectedMessageEntry = this.get('selectedMessageEntry');
      if (this.get('displayingInbox') && selectedMessageEntry && !selectedMessageEntry.get('read')) {
        log('mark message as read');
        this.markRead(selectedMessageEntry);
      }
    }.observes('selectedMessageEntry'),

    setRecipientIsUnknown: function(value) {
      this.setPath('newMessage.recipientUnknown', value);
    },

  });

// New Message Center Views and Dialogs
  module.MessageCenterNewDialog = module.PopUpDialog.extend({
    templateName: 'message-center-dialog',
    classNames: ['message-center-dialog'],

    character: null,
    alliance: null,
  });

    // New Message Write Dialog
  module.MessageWriteDialog = module.PopUpDialog.extend({
    templateName: 'message-write-dialog',

    isAllianceMessage: function(){
      var alliance = this.getPath('alliance');
      return (alliance !== undefined && alliance !== null);
    }.property('alliance'),

    closeDialog: function() {
      this.destroy();
    },

    destroyDialog: function()
    {
      //destroy message center dialog after success submit
      this.destroy();
    },
  });

  // New Message Read Dialog
  module.MessageReadDialog = module.PopUpDialog.extend({
    templateName: 'message-read-dialog',
    //classNames: ['message-center-dialog'],
    timeString: function() {
      return AWE.Util.localizedDateTime(this.getPath('message.created_at'));
    }.property('message.created_at').cacheable(),

    closeDialog: function() {
      this.destroy();
    },

    deleteClicked: function() {
      var selectedMessageEntry = this.get('message');
      AWE.Action.Messaging.createDeleteMessageAction(selectedMessageEntry).send();
      this.destroy();
    },

    forwardClicked: function() {
      var currentController = this.get('controller');
      var dialog = AWE.UI.Ember.MessageWriteDialog.create({
        controller: currentController,

        subject:   'Fwd: ' + (this.getPath('message.subject') || ''),
        body:      ' \n\n\n---- On  ' + AWE.Util.localizedDateTime(this.getPath('message.created_at')) + ' ' +
                    (this.getPath('message.sender.name') || 'Sytem') + ' wrote to ' +
                    this.getPath('message.recipient.name') + ':\n\n' +
                    AWE.Util.htmlToAscii(this.getPath('message.message.body')),
      });
      this.setPath('parentView.parentView.childView', dialog);
      
      WACKADOO.presentModalDialog(dialog);
    },

    replyClicked: function() {
      var currentController = this.get('controller');
      var dialog = AWE.UI.Ember.MessageWriteDialog.create({
        controller: currentController,

        recipient: this.getPath('message.sender.name'),  
        subject:   'Re: ' + (this.getPath('message.subject') || ''),
        body:      ' \n\n\n---- On  ' + AWE.Util.localizedDateTime(this.getPath('message.created_at')) + ' ' +
                    (this.getPath('message.sender.name') || 'someone') + ' wrote:\n\n' +
                    AWE.Util.htmlToAscii(this.getPath('message.message.body')),
      });
      this.setPath('parentView.parentView.childView', dialog);
      
      WACKADOO.presentModalDialog(dialog);
    },

  });

  // New Message Write View
  module.MessageWriteView = Ember.View.extend({
    templateName: 'message-write-view',

    init: function() {
      this._super();

      this.set('recipientValue', this.getPath('parentView.recipient'));
      this.set('allianceValue', this.getPath('parentView.alliance'));
      this.set('subjectValue', this.getPath('parentView.subject'));
      this.set('bodyValue', this.getPath('parentView.body'));
    },

    playerNamePlaceholder: function(){
      return AWE.I18n.lookupTranslation('general.playerName');
    }.property(),

    subjectPlaceholder: function(){
      return AWE.I18n.lookupTranslation('messaging.subject');
    }.property(),

    recipientValue: null,
    allianceValue: null,
    subjectValue: null,
    bodyValue: null,

    submitMessage: function() {
      var sendNewMessage = null;
      sendNewMessage = module.NewMessage.create({
        recipient: this.get('recipientValue'),
        alliance:  this.get('allianceValue'),
        subject:   this.get('subjectValue'),
        body:      this.get('bodyValue'),
        sender_id: AWE.GS.CharacterManager.getCurrentCharacter().get('id'),
      });
    this.get("controller").sendMessage(sendNewMessage);
    },

  });


  module.MessageCenterTabView = module.TabViewNew.extend({

    character: null,
    alliance: null,

    init: function() {
      this.set('tabViews', [
        { key:   "tab1",
          title: AWE.I18n.lookupTranslation('messaging.inbox'), 
          view:  AWE.UI.Ember.MailTab1.extend({
            controllerBinding: "parentView.parentView.controller",
            characterBinding: "parentView.parentView.character",
            allianceBinding: "parentView.parentView.alliance",
          }),
          buttonClass: "left-menu-button",
          
        }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
        { key:   "tab2",
          title: AWE.I18n.lookupTranslation('messaging.outbox'), 
          view:  AWE.UI.Ember.MailTab2.extend({
            controllerBinding: "parentView.parentView.controller",
            characterBinding: "parentView.parentView.character",
            allianceBinding: "parentView.parentView.alliance",
          }),
          buttonClass: "middle-menu-button",
        },
        { key:   "tab3",
          title: AWE.I18n.lookupTranslation('messaging.newMessage'), 
          view:  AWE.UI.Ember.MailTab3.extend({
            controllerBinding: "parentView.parentView.controller",
            characterBinding: "parentView.parentView.character",
            allianceBinding: "parentView.parentView.alliance",
          }),
          buttonClass: "right-menu-button",
        }
      ]);
      
      this._super();
    },
  });

  module.InboxTab = module.MessageCenterView.extend({
    templateName: 'message-center-inbox-tab',

    childView: null,

    updateControllerCurrentView: function(){
      this.get('controller').messageView = this;
    }.observes('controller'),

    destroyDialog: function()
    {
      var viewToDestroy = this.get('childView');
      if(viewToDestroy != null)
      {
        viewToDestroy.destroy();
      }
    },
  });

  module.OutboxTab = module.MessageCenterView.extend({
    templateName: 'message-center-outbox-tab',

    display: 'outbox',
    childView: null,

    updateControllerCurrentView: function(){
      this.getPath('controller').messageView = this;
    }.observes('controller'),

    destroyDialog: function()
    {
      var viewToDestroy = this.get('childView');
      if(viewToDestroy != null)
      {
        viewToDestroy.destroy();
      }
    },
  });

  module.NewMessageNewView = module.MessageCenterView.extend({
    templateName: 'message-center-new-message-tab',

    display: '',
    controller: null,

    updateControllerCurrentView: function(){
      this.getPath('controller').messageView = this;
    }.observes('controller'),

    destroyDialog: function()
    {
      //destroy message center dialog after success submit
      this.getPath('parentView.parentView.parentView.parentView').destroy()
    },
  });

  module.MailTab1 = Ember.View.extend({
    templateName: 'mail-tab1',

    character: null,
    alliance: null,

  });
  module.MailTab2 = Ember.View.extend({
    templateName: 'mail-tab2',

    character: null,
    alliance: null,
  });
  module.MailTab3 = Ember.View.extend({
     templateName: 'mail-tab3',

    character: null,
    alliance: null,
  });

  module.MessageEntry = Ember.View.extend({
     templateName: 'message-entry',
     classNames: 'read sent',

     //character: 'AWE.GS.CharacterManager.getCharacter(characterId)',

     //var character = AWE.GS.CharacterManager.getCharacter(characterId);
     message: null,
     timeString: function() {
      return AWE.Util.localizedDateTime(this.getPath('message.created_at'));
    }.property('message.created_at').cacheable(),
     
    onClickEntry: function(){
      var self = this;
      var messageEntry = this.get('message');
      var currentController = this.get('controller');
      if (messageEntry && !messageEntry.get('message')) {
        messageEntry.fetchMessage();
      }
      var dialog = AWE.UI.Ember.MessageReadDialog.create({
        message: messageEntry,
        isInbox: this.getPath('parentView.displayingInbox'),
        controller: currentController,
        parentView: self,
      });
      WACKADOO.presentModalDialog(dialog);
      
      if (!messageEntry || messageEntry.get('read')) {  // already marked as read?
        return ;
      }
      AWE.Action.Messaging.createMarkMessageReadAction(messageEntry).send();
    }
  });

  return module;
    
}(AWE.UI.Ember || {}));




