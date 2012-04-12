/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/armyviews.html');
  
  module.ArmyInfoView = module.Dialog.extend({
    templateName: 'army-details',
    changeNamePressed: function() { alert ('Action not connected: changeNameWasPressed.'); },
/*    close: function() { log('in close');
      if (this.onClose) { log('call onClose');
        this.onClose(this);
      }
      this.destroy();
    }, */
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




