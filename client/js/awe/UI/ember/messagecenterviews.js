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
  
  
  module.MessageCenterView = Ember.View.extend({
    templateName: 'message-center',
    
    character: null,
    messageBoxBinding: "character.inbox",
  });


  return module;
    
}(AWE.UI.Ember || {}));




