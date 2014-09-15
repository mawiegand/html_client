/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.ArmyNewChangeDialog = module.PopUpDialog.extend({
    templateName: 'army-new-change-dialog'
  });
  
  return module;
    
}(AWE.UI.Ember || {}));