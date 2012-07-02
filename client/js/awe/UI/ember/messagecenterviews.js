/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {}; 

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/messagecenter.html');

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
      return this.get('value') === null || this.get('value') === undefined; 
    }.property('value').cacheable(),
  });

  module.MessageView = Ember.View.extend({
    templateName: 'message',
    
    timeString: function() {
      var isoDate = this.getPath('message.created_at');
      if (!isoDate) {
        return null;
      }
      var date = Date.parseISODate(isoDate);
     
      return date.toLocaleString();

    }.property('message.created_at').cacheable(),
  });
  
  
  module.NewMessageView = Ember.View.extend({
    tagName:      'form',
    templateName: 'message-edit',

    didInserElement: function() {
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
    subject: null,
    body: null,
  });
  
  module.MessageCenterView = Ember.View.extend({
    templateName: 'message-center',
    
    character: null,
    inboxBinding: "character.inbox",
    outboxBinding: "character.outbox",
    archiveBinding: "character.archive",
    
    newMessage: null,
    
    selectedMessageEntry: null,
    selectedMessageBinding: 'selectedMessageEntry.message',
    
    display: 'inbox',
    
    isFormVisible: false,
    
    showForm: function() {
      if (!this.get('newMessage')) {
        this.set('newMessage', module.NewMessage.create({
          sender_id: AWE.GS.CharacterManager.getCurrentCharacter().get('id'),
        }));
      }
      this.set('isFormVisible', true);
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

  });

  return module;
    
}(AWE.UI.Ember || {}));




