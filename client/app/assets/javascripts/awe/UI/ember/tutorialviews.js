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
    
    questStatesBinding: 'tutorialState.notClosedQuestStates',
    
    redeemButtonPressed: function(questStateId) {
      log('ERROR Action not connected: redeemButtonPressed.');
    },
  });  
  
  module.QuestListEntryView = Ember.View.extend({
    templateName: 'quest-list-entry-view',
    
    questState: null,
  
    redeemButtonPressed: function() {
      log('---> QuestListEntryView redeemButtonPressed', this.getPath('questState.id'));
      this.get('parentView').redeemButtonPressed(this.getPath('questState.id'));
    },
  });  
  
  module.QuestStartedView = module.InfoDialog.extend({
    templateName: 'quest-started-view',
    quest: null,
  });  
  
  module.QuestFinishedView = module.InfoDialog.extend({
    templateName: 'quest-finished-view',
    quest: null,
    questObserver: function() {
      log('--------> quest', this.get('quest'));
    },
  });  
  
  module.QuestResourceRewardView = Ember.View.extend({
    templateName: 'quest-resource-reward-view',
    resource: null,
    resourceName: function() {
      return AWE.Util.Rules.lookupTranslation(AWE.GS.RulesManager.getRules().getResourceTypeWithSymbolicId(this.getPath('resource.resource')).name);
    }.property('resource').cacheable(),
  });  
  
  module.QuestResourceRewardsView = Ember.View.extend({
    templateName: 'quest-resource-rewards-view',
    resources: null,
  });  
  
  return module;  
    
}(AWE.UI.Ember || {}));