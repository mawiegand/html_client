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
  
  module.TextInputDialog = Ember.View.extend({
    templateName: 'text-input-dialog',
    heading: 'set a heading',
    input: '',
    okPressed: function() { alert ('Action not connected: okPressed.'); },
    cancelPressed: function() { alert ('Action not connected: cancelPressed.'); },
  });
      
  return module;  
    
}(AWE.UI.Ember || {}));