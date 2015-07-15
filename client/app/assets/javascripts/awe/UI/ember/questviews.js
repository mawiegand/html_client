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

    epicQuests: function() {
      var epics = this.get('questStates').filter(function(state){
        return state.getPath('quest.type') === "epic" && state.getPath('quest.tutorial') === false;
      });

      return epics;
    }.property('questStates'),
    
    redeemButtonPressed: function(questState) {
      questState.set('redeeming', true);
      AWE.GS.TutorialStateManager.redeemRewards(questState, null, function() {
        questState.set('redeeming', false);
      });
    },
    
    showQuestInfoPressed: function(quest) {
      AWE.GS.TutorialStateManager.showQuestInfoDialog(quest);
    },
    
    okPressed: function() {
      AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_quest_button');
      $('#layers').css('overflow', 'visible');
      this.destroy();
    }
  });  
  
  module.QuestListEntryView = Ember.View.extend({
    templateName: 'quest-list-entry-view',
    
    questState: null,

  
    redeemButtonPressed: function() {
      this.get('parentView').redeemButtonPressed(this.get('questState'));
    },
  
    showQuestInfoPressed: function() {
      this.get('parentView').showQuestInfoPressed(this.getPath('questState.quest'));
    },
  
    
    classNameBindings: ['finished'],
    
    finished: function() {
      return this.getPath('questState.status') === AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status'),        
  });  
  
  module.QuestInfoDialog = module.InfoDialog.extend({
    templateName: 'quest-info-dialog',
    classNameBindings: ['quest-info-dialog'],
    header: null,
    questBinding: 'questState.quest',
    questState: null,
    redeeming: false,
    spinningBackground: false,
    popupAnimations: false,
    spinningAnimation: false,

    finished: function() {
      return this.getPath('questState.status') === AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status'),        

    redeemLaterButtonPressed: function() {
      this.destroy();
    },

    redeemButtonPressed: function() {
      if (this.get('redeeming')) {
        return ;
      }
      var that = this;
      this.set('redeeming', true);
      
      AWE.GS.TutorialStateManager.redeemRewards(this.get('questState'), function() {
        that.destroy();
      }, function() {
        that.set('redeeming', false);
      });
    },

    okPressed: function() {
      var hasRewards = this.getPath('quest.rewards');
      var isFinished = this.get('finished');
      
      log('QUEST STATUS', hasRewards, isFinished, this.get('quest'), this.get('questState'), this.getPath('questState.status'));
      
      if (hasRewards && isFinished) {
        this.redeemButtonPressed(); // remove the function later, if this proves to be good.
      }
      else {
        $('#layers').css('overflow', 'visible');
        this.destroy();
      }
    },

  });  
  
  module.QuestTextView = Ember.View.extend({
    templateName: 'quest-text-view',
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
    
    newArmyQuest: function() {
      return this.getPath('quest.id') == 17;  // FIXME schneller Hack zur Anzeige der Knopfes in der Quest
    }.property('quest.id').cacheable(),
    
    toSettlementQuest: function() {
      return this.getPath('quest.id') == 11 || this.getPath('quest.id') == 7;  // FIXME schneller Hack zur Anzeige der Knopfes in der Quest
    }.property('quest.id').cacheable(),
    
    attackQuest: function() {
      return this.getPath('quest.id') == 147;  // FIXME schneller Hack zur Anzeige der Knopfes in der Quest
    }.property('quest.id').cacheable(),
    
    checkQuestAnswerPressed: function() {
      
      if (!AWE.GS.TutorialStateManager.tutorialEnabled()) return;
      
      var that = this;

      var quest = this.get('quest');
      var questState = this.get('questState');
      var textboxTest = quest.reward_tests.textbox_test;
      var answerText = this.get('answerText');
      
      if (textboxTest != null) {
        if (questState.checkTextbox(textboxTest, answerText)) {
          this.set('checking', true);  // hide check button
          
          var questCheckAction = AWE.Action.Tutorial.createCheckQuestAction(quest.id, answerText);
          questCheckAction.send(function(status) {
            if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
              questState.set('status', AWE.GS.QUEST_STATUS_FINISHED);
            }
            else {
              that.set('checking', false);
              that.set('error', true);
            }
          });
        }
        else {
          that.set('checking', false);
          that.set('error', true);
        }
      }
      else {
        log('ERROR in AWE.GS.TutorialManager.checkForTextboxRewards: missing textboxTest');
      }
    }
  });  
  
  module.QuestRewardsView = Ember.View.extend({
    templateName: 'quest-rewards-view',
    resource: null,
    resourceName: function() {
      return AWE.Util.Rules.lookupTranslation(AWE.GS.RulesManager.getRules().getResourceTypeWithSymbolicId(this.getPath('resource.resource')).name);
    }.property('resource').cacheable(),
  }); 

  module.SubquestListView = Ember.View.extend({
    templateName: 'subquest-list-view',
    epic: null,

    subQuestStates: function() {
      var quests = [];
      var ids = this.getPath('epic.subquests');
      ids.forEach(function(id) {
        AWE.GS.TutorialStateManager.getTutorialState().quests.content.forEach(function(state){
          if(state.quest_id === id)
          {
            quests.push(state);
          }
        });
      });
      return quests;
    }.property('epic.subquests'),

    subCount: function() {
      return 4;
      return this.getPath('subQuestStates').length;
    }.property('subQuestStates'),

    twoColumnLayout: function() {
      return this.get('subCount') === 2;
    }.property('subCount'),

    threeColumnLayout: function() {
      return this.get('subCount') === 3;
    }.property('subCount'),

    fourColumnLayout: function() {
      return this.get('subCount') === 4;
    }.property('subCount')
  });

  module.SubquestItemView = Ember.View.extend({
    templateName: 'subquest-item-view',
    questState: null,

    finished: function() {
      return this.getPath('questState.status') >= AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status').cacheable(),

    progress: function() {
      return this.getPath('questState.progress')[0];
    }.property('questState')
  });


  return module;
    
}(AWE.UI.Ember || {}));