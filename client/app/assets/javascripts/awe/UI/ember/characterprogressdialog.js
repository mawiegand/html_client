/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.CharacterProgressDialog = module.Dialog.extend({
    templateName: 'character-progress-dialog',
    
    character: null,
        
    okClicked: function() {
      this.destroy();
    },
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




