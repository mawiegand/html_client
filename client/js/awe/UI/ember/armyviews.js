/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

///// DEPRECATED; Already deprecated, we'll be using Ember.JS for all DOM-inserted views.

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

APP = {};
APP.alert = function() {alert('hello!')};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/armyviews.html');
  
  
  module.ArmyInfoView = Ember.View.extend({
    templateName: 'army-details',
    changeNamePressed: function() { alert ('Action not connected: changeNameWasPressed.'); },
    closePressed: function() { alert ('Action not connected: closePressed.'); },
  });
      
  return module;  
    
}(AWE.UI.Ember || {}));




