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
  


  module.QuestDialog = module.InfoDialog.extend({
    templateName: 'quest-dialog',
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
    
    advisor: function() {
      if (this.get('finished')) {
        return 'advisor ' + this.getPath('quest.advisor') + '-quest-end';
      }
      else {
        return 'advisor ' + this.getPath('quest.advisor') + '-quest-start';
      }
    }.property('quest.advisor', 'finished').cacheable(),

  
      
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

  module.CavePainting = Ember.View.extend({
    templateName: 'quest-cave-painting-view',
    questBinding: 'questState.quest',

    cave_painting_url:'/client/assets/cavepainting/',
    spiral_url:null,

    carving_colored_objs:[],

    // these should be 16. Each quest refers to a colored_carving and they are ordered in the
    // way the colored images are shown.
    quest_ids: [0,3,6,7,9,12,20,24,27,31,34],



    init:function()
    {

      this._super();
      this.unlock_painting();
    },

    close_cave_painting:function(){
      this.destroy();
    },

    get_version_number:function(level){

      // concatenate 0 so the number 8 for e.g becomes 08. Since our spiral images
      // are named like this.


    // level+1 because we're passing the index of loop in this function which starts from 0.
    // there is no image with the following index 00 hence we +1 to make it 01.
      level = level+1;

      if(level<10)
        version = "0"+level;
      else
        version = level;

      return version;
    },


    get_spiral_version:function(level){
      return "spiral_"+this.get_version_number(level)+".png";
    },

    get_carving_colored_version:function(level){
      return this.get_version_number(level);
    },


    unlock_painting:function(){

       questids = this.get('quest_ids');

      // this is used to find out the number of completed quests out of the given
      // quests. Based on this variable count we load the spiral image.
       total_quests_completed = 0;

       this.set('carving_colored_objs',new Array());

       for(i=0;i<questids.length;i++)
       {
          // if it's not null, the quest has an entry and it is completed
          if(AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(questids[i])!==null)
          {
             carving_colored_pic_url = this.get('cave_painting_url')+'carving_colored_'+this.get_carving_colored_version(i)+'.png';
             carving_colored_pic_class = 'cave_painting_carving_colored_'+this.get_carving_colored_version(i);

             current_carvings = this.get('carving_colored_objs');
             current_carvings.push({ url : carving_colored_pic_url , css_class : carving_colored_pic_class});

             this.set('carving_colored_objs',current_carvings);
             total_quests_completed++;
          }
          else
          {
            break;
          }
       }

       this.set('spiral_url',this.get('cave_painting_url')+this.get_spiral_version(total_quests_completed));


    },

  });

  return module;
    
}(AWE.UI.Ember || {}));