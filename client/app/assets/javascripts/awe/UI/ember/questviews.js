/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.QuestEpicView = module.InfoDialog.extend({
    templateName: 'quest-epic-view',  
    tutorialState: null,
    questStateBinding: 'tutorialState.selected_quest_state',
    questBinding: 'tutorialState.selected_quest_state.quest',
    okPressed: function() {
      AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_quest_button');
      $('#layers').css('overflow', 'visible');
      this.destroy();
      //WACKADOO.closeAllModalDialogs();
    },
    advisor: function() {
      return 'advisor ' + this.getPath('quest.advisor') + '-quest-start';
    }.property('questState.quest.advisor', 'finished').cacheable(),
    
    subquestStates: function(){
      var indices = this.getPath('quest.subquests');
      var array = new Array();
      if(indices && indices.length > 0)
      {
        for(var i = 0; i < indices.length; i++)
        {
          var quest_id = indices[i];
          var questState = AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(quest_id);
          if (questState !== null) {
            questState.checkForRewards();
            array.push(questState);
          }
        }
        return array;
      }
      else
      {
        return null;
      }
    }.property('quest.subquests').cacheable(),
    
    subquestStatesCountEqualsTwo: function() {
      return (this.get('subquestStates').length == 2);
    }.property('subquestStates').cacheable(),
    
    subquestStatesCountEqualsThree: function() {
      return (this.get('subquestStates').length == 3);
    }.property('subquestStates').cacheable(),
    
    subquestStatesCountEqualsFour: function() {
      return (this.get('subquestStates').length == 4);
    }.property('subquestStates').cacheable(),
    
    subquestStatesAt0: function() {
      return this.get('subquestStates')[0];
    }.property('subquestStates').cacheable(),
    
    subquestStatesAt1: function() {
      return this.get('subquestStates')[1];
    }.property('subquestStates').cacheable(),    
    
    subquestStatesAt2: function() {
      return this.get('subquestStates')[2];
    }.property('subquestStates').cacheable(),
  
    subquestStatesAt3: function() {
      return this.get('subquestStates')[2];
    }.property('subquestStates').cacheable(),    
    
    subquestStatesAt0Finished: function() {
      return this.get('subquestStates')[0].get('status') == AWE.GS.QUEST_STATUS_FINISHED;
    }.property('subquestStates').cacheable(),
    
    subquestStatesAt1Finished: function() {
      return this.get('subquestStates')[1].get('status') == AWE.GS.QUEST_STATUS_FINISHED;
    }.property('subquestStates').cacheable(),
    
    subquestStatesAt2Finished: function() {
      return this.get('subquestStates')[2].get('status') == AWE.GS.QUEST_STATUS_FINISHED;
    }.property('subquestStates').cacheable(),    
    
    subquestStatesAt3Finished: function() {
      return this.get('subquestStates')[2].get('status') == AWE.GS.QUEST_STATUS_FINISHED;
    }.property('subquestStates').cacheable(),
    
  });  
  
  module.QuestEpicSub = Ember.View.extend({
    templateName: 'quest-epic-view-sub',

    actual: function() {
      return this.getPath('questState.actual');
    }.property('questState.actual'), 

    threshold: function() {
      return this.getPath('questState.threshold');
    }.property('questState.threshold'), 
    
    advisor: function() {
      if (this.get('finished')) {
        return 'advisor ' + this.getPath('questState.quest.advisor') + '-quest-end';
      }
      else {
        return 'advisor ' + this.getPath('questState.quest.advisor') + '-quest-start';
      }
    }.property('questState.quest.advisor', 'finished').cacheable(),
    
    epic_actual_threshold: function() {
      if (this.get('finished')) {
        return 'epic_actual_threshold finished';
      }
      else {
        return 'epic_actual_threshold';
      }
    }.property('finished').cacheable(),
    
    finished: function() {
      return this.getPath('questState.status') === AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status'),     
    
    classNameBindings: ['finished'],
       
  }); 
  
  
  
  
  module.QuestListView = module.InfoDialog.extend({
    templateName: 'quest-list-view',
    
    tutorialState: null,
    
    questStatesBinding: 'tutorialState.notClosedQuestStates',
    
    initialize: function() {
      this.tutorialState.set('selected_quest_state', null);
    },
    
    redeemButtonPressed: function(questState) {
      questState.set('redeeming', true);
      AWE.GS.TutorialStateManager.redeemRewards(questState, function(){
        questState.set('redeeming', false);
        questState.get('tutorialState').set('selected_quest_state', null);        
      }, function() {
        questState.set('redeeming', false);
      });
    },
    
    showEpicQuestDialog: function() {
      WACKADOO.showEpicQuestDialog();
    },
    
    showQuestInfoPressed: function(questState) {
      //var quest = questState.get('quest');
      // types found in xml: epic, epic_optional, sub, optional
      this.tutorialState.set('selected_quest_state', questState);
      //AWE.GS.TutorialStateManager.showQuestInfoDialog(quest);
    },
    
    okPressed: function() {
      AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_quest_button');
      $('#layers').css('overflow', 'visible');
      this.destroy();
      //WACKADOO.closeAllModalDialogs();
    }
  });  
  
  module.QuestListItemView = Ember.View.extend({
    templateName: 'quest-list-item-view',
    
    questState: null,

    redeemButtonPressed: function() {
      this.get('parentView').redeemButtonPressed(this.get('questState'));
    },
  
    showQuestInfoPressed: function() {
      this.get('parentView').showQuestInfoPressed(this.getPath('questState'));
    },

   
    
    finished: function() {
      return this.getPath('questState.status') === AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status'),   
    
    epic: function()
    {
      return this.getPath('questState.questIsEpic');
    }.property('questState.questIsEpic').cacheable(),
    
    optional: function()
    {
      return !this.getPath('questState.questIsEpic');
    }.property('questState.questIsEpic').cacheable(),
    
    tutorial: function()
    {
      return this.getPath('questState.quest').tutorial;
    }.property('questState.quest.tutorial').cacheable(),
    
    advisor: function() {
      if (this.get('finished')) {
        return 'advisor ' + this.getPath('questState.quest.advisor') + ' sketched';
      }
      else {
        return 'advisor ' + this.getPath('questState.quest.advisor') + ' sketched';
      }
    }.property('questState.quest.advisor', 'finished').cacheable(),
    
    classNameBindings: ['finished', 'epic', 'optional', 'tutorial'], 
  });  
  
  module.QuestListItemViewDetailOverview = Ember.View.extend({
    templateName: 'quest-list-item-view-detail-overview',
    questState: null,    
    
    character: function() {
      var ret = AWE.GS.CharacterManager.getCurrentCharacter();
      return ret;
    }.property('character'),
    
    character_rank: function() {
      var character = this.get('character');
      if(AWE.GS.RulesManager.getRules().character_ranks.mundane != null)
      {
        var ret = AWE.GS.RulesManager.getRules().character_ranks.mundane[character.get('mundane_rank')];
        return ret;
      }
      return '';
    }.property('character_rank'),
    
    character_rank_name: function() {
      return this.getPath('character_rank.name');
    }.property('character_rank'),
    
    character_mundane_rank_numeric: function() {
      return this.getPath('character.mundane_rank_numeric');
    }.property('character_rank'),
    
    character_exp: function() {
      return this.getPath('character.exp');
    }.property('character'),
    
    character_population: function(){
      var settlements = AWE.GS.SettlementManager.getOwnSettlements();
      var sum = 0;
      AWE.Ext.applyFunctionToElements(settlements, function(settlement) {
        sum += settlement.score;
      });
      return sum;
    }.property('character'),
    
    character_capacity: function(){
      var settlements = AWE.GS.SettlementManager.getOwnSettlements();
      var sum = 0;
      AWE.Ext.applyFunctionToElements(settlements, function(settlement) {
        sum += parseInt(settlement.resource_stone_capacity);
      });
      return sum;
    }.property('character'),
    
    character_fortresses: function(){
      var settlements = AWE.GS.SettlementManager.getOwnSettlements();
      var sum = 0;
      AWE.Ext.applyFunctionToElements(settlements, function(settlement) {
        sum += settlement.get('isFortress') == true ? 1 : 0;
      });
      return sum;
    }.property('character'),
    
    character_outposts: function(){
      var settlements = AWE.GS.SettlementManager.getOwnSettlements();
      var sum = 0;
      AWE.Ext.applyFunctionToElements(settlements, function(settlement) {
        sum += settlement.get('isOutpost') == true ? 1 : 0;
      });
      return sum;
    }.property('character'),
    
    character_settlement_points: function(){
      return this.getPath('character.settlementPointsAvailable');
    }.property('character'),
    
    character_settlement_points_total: function(){
      return this.getPath('character.settlement_points_total');
    }.property('character'),
    
    character_victories: function(){
      return this.getPath('character.victories');
    }.property('character'),
    
    classNameBindings: ['finished'],
    finished: function() {
      return this.getPath('questState.status') === AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status'),        
  }); 
  
  module.QuestListItemViewDetailEpic = Ember.View.extend({
    templateName: 'quest-list-item-view-detail-epic',
    
    redeemButtonPressed: function() {
      this.get('parentView').redeemButtonPressed(this.get('questState'));
    },
    
    subquestStates: function(){
      var indices = this.getPath('questState.quest.subquests');
      var array = new Array();
      if(indices && indices.length > 0)
      {
        for(var i = 0; i < indices.length; i++)
        {
          var quest_id = indices[i];
          var questState = AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(quest_id);
          if (questState !== null) {
            questState.checkForRewards();
            array.push(questState);
          }
        }
        return array;
      }
      else
      {
        return null;
      }
    }.property('questState.quest.subquests'),
    
    advisor: function() {
      return 'advisor ' + this.getPath('questState.quest.advisor') + ' sketched';
    }.property('questState.quest.advisor', 'finished').cacheable(),
    
    finished: function() {
      return this.getPath('questState.status') === AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status'),     
    
    classNameBindings: ['finished'],
       
  }); 
  
  module.QuestListItemViewDetailEpicSub = Ember.View.extend({
    templateName: 'quest-list-item-view-detail-epic-sub',

    actual: function() {
      return this.getPath('questState.actual');
    }.property('questState.actual'), 

    threshold: function() {
      return this.getPath('questState.threshold');
    }.property('questState.threshold'), 
    
    advisor: function() {
      if (this.get('finished')) {
        return 'advisor ' + this.getPath('questState.quest.advisor') + '-quest-end';
      }
      else {
        return 'advisor ' + this.getPath('questState.quest.advisor') + '-quest-start';
      }
    }.property('questState.quest.advisor', 'finished').cacheable(),
    
    finished: function() {
      return this.getPath('questState.status') === AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status'),     
    
    classNameBindings: ['finished', 'quest-list-item'],
       
  }); 
  
  module.QuestListItemViewDetailQuest = Ember.View.extend({
    templateName: 'quest-list-item-view-detail-quest',
    
    redeemButtonPressed: function() {
      this.get('parentView').redeemButtonPressed(this.get('questState'));
    },
    
    actual: function() {
      return this.getPath('questState.actual');
    }.property('questState.actual'), 

    threshold: function() {
      return this.getPath('questState.threshold');
    }.property('questState.threshold'), 
    
    advisor: function() {
      return 'advisor ' + this.getPath('questState.quest.advisor') + ' sketched';
    }.property('questState.quest.advisor', 'finished').cacheable(),
    
    finished: function() {
      return this.getPath('questState.status') === AWE.GS.QUEST_STATUS_FINISHED;
    }.property('questState.status'),     
    
    classNameBindings: ['finished'],      
  }); 
  

  //module.QuestDialog = module.InfoDialog.extend({
  module.QuestDialog = module.PopUpDialog.extend({
    templateName: 'quest-dialog',
    header: null,
    questBinding: 'finishedQuestState.quest',
    questState: 'finishedQuestState',
    nextQuestBinding: 'nextQuestState.quest',
    nextState: 'nextState',
    redeeming: false,
    redeemed_successfully: false,
    spinningBackground: false,
    popupAnimations: false,
    spinningAnimation: false,
        
    finished: function() {
      return this.getPath('finishedQuestState.status') === AWE.GS.QUEST_STATUS_FINISHED;
    }.property('finishedQuestState.status'),        

    redeemLaterButtonPressed: function() {
      $('#layers').css('overflow', 'visible');
      this.destroy();
      //WACKADOO.closeAllModalDialogs();
    },
    
    closeDialogRequested: function() {
      if (!AWE.GS.TutorialStateManager.tutorialEnabled()) {
        $('#layers').css('overflow', 'visible');
        this.destroy();
        //WACKADOO.closeAllModalDialogs();
      }
    },

    redeemButtonPressed: function() {
      if (this.get('redeeming')) {
        return ;
      }
      var that = this;
      this.set('redeeming', true);
      
      AWE.GS.TutorialStateManager.redeemRewards(this.get('finishedQuestState'), function() {
        that.set('redeemed_successfully', true);
        that.set('redeeming', false);
      }, function() {
        that.set('redeemed_successfully', false);
        that.set('redeeming', false);
      });
    },
    redeemButtonVisible: function(){
      if(this.get('finishedQuestState') != null)
        if(this.get('redeemed_successfully') == false)
          return true;
      return false;
    }.property('finishedQuestState', 'nextQuestState', 'redeemed_successfully'),
    
    nextButtonVisible: function(){
      if(this.get('finishedQuestState') == null)
        return true;
      if(this.get('redeemed_successfully') == true)
        return true;      
      return false;
    }.property('finishedQuestState', 'nextQuestState', 'redeemed_successfully'),
    
    advisor: function() {
      return 'advisor ' + this.getPath('quest.advisor') + ' sketched';
    }.property('quest.advisor', 'finished').cacheable(),

    nextAdvisor: function() {
      return 'advisor ' + this.getPath('nextQuest.advisor') + ' sketched';
    }.property('nextQuest.advisor').cacheable(),
    
    nextSubquestStates: function(){
      var indices = this.getPath('nextQuestState.quest.subquests');
      var array = new Array();
      if(indices && indices.length > 0)
      {
        for(var i = 0; i < indices.length; i++)
        {
          var quest_id = indices[i];
          var questState = AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(quest_id);
          array.push(questState);
        }
        return array;
      }
      else
      {
        return null;
      }
    }.property('nextQuestState.quest.subquests'),
    
    /** runs the popup animations */
    didInsertElement: function() {
      // Display full animations for a Reward Dialog that hasn't been displayed before.
      
      var popupAnimations = this.get('popupAnimations');
      var spinningAnimation = this.get('spinningAnimation');
      var self = this;
                    
      if (popupAnimations) {
        
        // prepare the dialog for animation
        self.$('.quest-dialog-content > *').hide();
        // TODO: set sizes to zero
        
        self.$(".quest-dialog-bg").delay(100).animate({
          height: '477px',
          width: '650px',
          marginTop: '38px',
          marginLeft: '-325px',
          zoom: AWE.Settings.hudScale
        }, {  duration: 600,
              easing: 'easeOutElastic',
              complete: function() {
            
                var random  = 250;
                var abstand = 250;
                var base    = 100;
        
                self.$('.quest-dialog-content > *').show();
                
                self.$('.quest-dialog-rewards-items li').each(function(index) {
                  var r = Math.ceil(Math.random() * random)+base;
                  var d = ((index+1) % 2) * index * abstand/4 + (index % 2) * (abstand - index*abstand/4);
                  
                  self.$(this).find('.quest-reward-item-icon').delay(d).animate({
                    width: '83.6%',
                    height: '81%',
                    top: '0px',
                    left: '0px',
                    opacity: '1'
                  }, {
                    duration: r,
                    easing: 'easeOutBack'
                  });
                  
                  self.$(this).find(".quest-reward-item-number").delay(d+abstand/2).animate({
                    opacity: 1.0,
                  },{
                    duration: r / 2,
                  });
                });
                  
                self.$(".quest-dialog-button").delay(base+abstand+random).animate({
                  width: '172px',
                  height: '129px',
                  top: '83%',
                  left: '83%'
                }, {
                  duration: 250,
                  easing: 'easeOutBack',
                  complete: function() {
                    if (spinningAnimation) {
                      if(navigator.userAgent.toLowerCase().indexOf('android') < 0)
                      {
                        self.set('spinningBackground', true);
                      }
                    }   
                  }
                });
              },
        });
      }
      else {
        
        self.$(".quest-dialog-bg").css({
          height: '477px',
          width: '650px',
          marginTop: '38px',
          marginLeft: '-325px',
          zoom: AWE.Settings.hudScale
        })
            
        self.$('.quest-dialog-rewards-items li .quest-reward-item-icon').css({
          width: '83.6%',
          height: '81%',
          top: '0px',
          left: '0px',
          opacity: '1'
        });
              
        self.$(".quest-dialog-rewards-items li .quest-reward-item-number").css({
          opacity: 1.0,
        });
                          
        self.$(".quest-dialog-button").delay(50).animate({
          width: '172px',
          height: '129px',
          top: '83%',
          left: '83%'
        }, {
          duration: 250,
          easing: 'easeOutBack',
          complete: function() {
            if (spinningAnimation) {
              if(navigator.userAgent.toLowerCase().indexOf('android') < 0)
              {
                self.set('spinningBackground', true);
              }
            }
          }
        });
        
      }
        
    }

  });  
  
  module.QuestView = Ember.View.extend({
    templateName: 'quest-view',
    questBinding: 'questState.quest',
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
      return AWE.Util.Rules.lookupTranslation(AWE.GS.RulesManager.getRules().getUnitTypeWithSymbolicId(this.getPath('unit.unit')).name);
    }.property('unit').cacheable(),
  });  
  
  module.QuestUnitRewardsView = Ember.View.extend({
    templateName: 'quest-unit-rewards-view',
    units: null,
  });

  return module;
    
}(AWE.UI.Ember || {}));