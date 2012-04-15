/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/standardviews.html');  
  
  module.Dialog = Ember.View.extend({
    onClose: null,
    destroy: function() {
      if (this.onClose) {
        this.onClose(this);
      }
      this._super();
    },
  });
  
  module.TextInputDialog = module.Dialog.extend({
    templateName: 'text-input-dialog',
    heading: 'set a heading',
    input: '',
    okPressed: function() { alert ('Action not connected: okPressed.'); },
    cancelPressed: function() { alert ('Action not connected: okPressed.'); },
  });
  
    
  module.ShoutBox = Ember.View.extend({
    templateName: 'shout-box',

    shouts: null,    
    shoutBoxInput: null,
    shoutBoxSendPressed: function() {
      var input = this.get('shoutBoxInput');
      if (input.length > 0) {
        if (this.shout) {
          this.shout(input);
        }
        else {
          console.log('ERROR in ShoutBox: shout not connected.');
        }
        this.set('shoutBoxInput', '');
      }
    },
    shout: null,
  });
    
      
  return module;  
    
}(AWE.UI.Ember || {}));