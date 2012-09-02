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
    
    showQuestInfoPressed: function(questId) {
      log('ERROR Action not connected: showQuestInfoPressed.');
    },
    
    redeemButtonPressed: function(questStateId) {
      log('ERROR Action not connected: redeemButtonPressed.');
    },
    
    okPressed: function() {
      this.destroy();
      AWE.GS.TutorialStateManager.checkForRewards();
    },
  });  
  
  module.QuestListEntryView = Ember.View.extend({
    templateName: 'quest-list-entry-view',
    
    questState: null,
  
    redeemButtonPressed: function() {
      log('---> QuestListEntryView redeemButtonPressed', this.getPath('questState.id'));
      this.get('parentView').redeemButtonPressed(this.getPath('questState.id'));
    },
  
    showQuestInfoPressed: function() {
      log('---> QuestListEntryView showQuestInfoPressed', this.getPath('questState.quest_id'));
      this.get('parentView').showQuestInfoPressed(this.getPath('questState.quest_id'));
    },
  });  
  
  module.QuestStartedDialog = module.InfoDialog.extend({
    templateName: 'quest-started-dialog',
    quest: null,
    questState: null,
  });  
  
  module.QuestFinishedDialog = module.InfoDialog.extend({
    templateName: 'quest-finished-dialog',
    quest: null,
    questState: null,
  });  
  
  module.QuestInfoDialog = module.InfoDialog.extend({
    templateName: 'quest-info-dialog',
    quest: null,
    questState: null,
  });  
  
  module.QuestView = Ember.View.extend({
    templateName: 'quest-view',
    quest: null,
    questState: null,
    answerText: null,
    answerTextObserver: function() {
      this.set('error', false);
    }.observes('answerText'),
    
    error: false,
    checking: false,
    
    finished: function() {
      return this.getPath('questState.status') >= AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status').cacheable(),
    
    checkQuestAnswerPressed: function() {
      if (!AWE.GS.TutorialStateManager.tutorialEnabled()) return;
      
      var that = this;

      var quest = this.get('quest');
      var questState = this.get('questState');
      var textboxTest = quest.reward_tests.textbox_test;
      var answerText = this.get('answerText');
      log('---> checkForTextboxRewards', questState, quest);
      
      if (textboxTest != null) {
        if (questState.checkTextbox(textboxTest, answerText)) {
          log('---> checkForTextboxRewards', true, 'with answerText', answerText);
          
          this.set('checking', true);  // knopf ausblenden
          
          // action erzeugen und an server schicken
          var questCheckAction = AWE.Action.Tutorial.createCheckQuestAction(quest.id, answerText);
          questCheckAction.send(function(status) {
            if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
              // callback: dialog anzeigen mit reward
              
              // set already to finished to avoid showing of form in quest finished view
              questState.set('status', AWE.GS.QUEST_STATUS_FINISHED);
              
              // quest dialog schließen 
              that.get('parentView').destroy();
              AWE.GS.TutorialStateManager.showQuestFinishedDialog(questState);
            }
            else {
              // fehlermeldung
              // knopf einblenden
              that.set('checking', false);
              that.set('error', true);
              
              // var dialog = AWE.UI.Ember.InfoDialog.create({
                // heading: 'Fehler',
                // message: 'Falsche Antwort, probier es gleich noch mal',
                // okPressed: function() {
                  // this.destroy();
                  // that.showQuestInfoDialog(questId);
                // },            
              // });          
              // WACKADOO.presentModalDialog(dialog);
              log('---> checkForTextboxRewards', false);
              // that.checkForNewQuests();
            }
          });
        }
        else {
          // fehlermeldung
          that.set('checking', false);
          that.set('error', true);
          // knopf einblenden

          log('---> Fehlermeldung für Textbox Test');
          // var dialog = AWE.UI.Ember.InfoDialog.create({
            // heading: 'Fehler',
            // message: 'Falsche Antwort, probier es gleich noch mal',
            // okPressed: function() {
              // this.destroy();
              // that.showQuestInfoDialog(questId);
            // },            
          // });          
          // WACKADOO.presentModalDialog(dialog);
          log('---> checkForTextboxRewards', false);
          // that.checkForNewQuests();
        }
      }
      else {
        log('ERROR in AWE.GS.TutorialManager.checkForTextboxRewards: missing textboxTest');
      }
    }
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
  
  module.QuestUnitRewardView = Ember.View.extend({
    templateName: 'quest-unit-reward-view',
    unit: null,
    unitName: function() {
      return AWE.Util.Rules.lookupTranslation(AWE.GS.RulesManager.getRules().getUniTypeWithSymbolicId(this.getPath('unit.unit')).name);
    }.property('unit').cacheable(),
  });  
  
  module.QuestUnitRewardsView = Ember.View.extend({
    templateName: 'quest-unit-rewards-view',
    units: null,
  });  
  
  return module;  
    
}(AWE.UI.Ember || {}));