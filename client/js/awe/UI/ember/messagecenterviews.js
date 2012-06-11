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
  
  /** brief overview about a message that is used in the message-list bar
   * in the left column of the message center. */
  module.MessageTeaserView = Ember.View.extend({
    templateName: 'message-teaser',
    
    timeString: function() {
      var oneDay = 1000 * 3600 * 24;
      var isoDate = this.getPath('message.created_at');
      if (!isoDate) {
        return null;
      }
      var date = Date.parseISODate(isoDate);
      var now = new Date();
      if (date.getDate() === now.getDate() && 
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()) {
        return date.getHours()+":"+date.getMinutes();
      }
      else if (now.getTime() - date.getTime() < oneDay) {
        return "yesterday";
      }
      else if (now.getTime() - date.getTime() < 2*oneDay) {
        return "2 days ago";
      }
      else if (now.getTime() - date.getTime() < 3*oneDay) {
        return "3 days ago";
      }
      else {
        return date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate();
      }
    }.property('message.created_at').cacheable(),
    
    /** computed property used for marking the message that has been selected
     * by the user. */
    selected: function() {
      var parentView = this.get('parentView');
      return parentView && parentView.get('selectedMessageEntry') === this.get('message');
    }.property('parentView.selectedMessageEntry').cacheable(),
    
    /** reacts to clicks on a message by making it the selected message. */
    click: function(event) {
      var messageEntry = this.get('message');
      this.get('parentView').set('selectedMessageEntry', messageEntry);
      if (messageEntry && !messageEntry.get('message')) {
        messageEntry.fetchMessage();
      }
    },     
  });
  
  module.MessageCenterView = Ember.View.extend({
    templateName: 'message-center',
    
    character: null,
    inboxBinding: "character.inbox",
    outboxBinding: "character.outbox",
    archiveBinding: "character.archive",
    
    isFormVisible: false,
    
    showForm: function() {
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
    
    selectedMessageEntry: null,
    selectedMessageBinding: 'selectedMessageEntry.message',
    
    display: 'inbox',
    
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




