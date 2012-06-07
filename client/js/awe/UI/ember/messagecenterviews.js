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
  
  module.MessageTeaserView = Ember.View.extend({
    templateName: 'message-teaser',
    
    click: function(event) {
      console.log('ON CLICK')
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
    messageBoxBinding: "character.inbox",
    
    selectedMessageEntry: null,
    selectedMessageBinding: 'selectedMessageEntry.message',
  });

  return module;
    
}(AWE.UI.Ember || {}));




