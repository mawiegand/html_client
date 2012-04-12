/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/alliancescreen.html');
  
  module.AllianceScreen = Ember.View.extend({
    templateName: 'alliance-screen',
    
    alliance: null,
  });
  
  return module;
    
}(AWE.UI.Ember || {}));