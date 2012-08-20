/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.QuestListView = module.InfoDialog.extend({
    templateName: 'quest-list-view',
    
    tutorialState: null,
    
    questStatesBinding: 'tutorialState.openQuestStates',
  });  
  
  module.QuestStartView = module.InfoDialog.extend({
    templateName: 'quest-start-view',
  });  
  
  module.QuestFinishedView = module.InfoDialog.extend({
    templateName: 'quest-finished-view',
  });  
  
  return module;  
    
}(AWE.UI.Ember || {}));