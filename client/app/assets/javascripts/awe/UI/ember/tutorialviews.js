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

    questListBodyClass: function() {
      if (AWE.Facebook.isRunningInCanvas) {
        return 'quest-list-scrollable';
      }
      else {
        return '';
      }
    }.property(),
    
    redeemButtonPressed: function(questState) {
//      log('--> redeem Button Pressed', questState)
      questState.set('redeeming', true);
      AWE.GS.TutorialStateManager.redeemRewards(questState, null, function() {
        questState.set('redeeming', false);
      });
    },
    
    showQuestInfoPressed: function(quest) {
//      log('--> show Quest Info Button Pressed', quest)
      AWE.GS.TutorialStateManager.showQuestInfoDialog(quest);
    },
    
    okPressed: function() {
      AWE.GS.TutorialStateManager.checkForCustomTestRewards('test_quest_button');          
      this.destroy();
    }
  });  
  
  module.QuestListEntryView = Ember.View.extend({
    templateName: 'quest-list-entry-view',
    
    questState: null,

  
    redeemButtonPressed: function() {
      // log('---> QuestListEntryView redeemButtonPressed', this.get('questState'));
      this.get('parentView').redeemButtonPressed(this.get('questState'));
    },
  
    showQuestInfoPressed: function() {
      // log('---> QuestListEntryView showQuestInfoPressed', this.getPath('questState.quest'));
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

    

    didInsertElement: function(){
      console.log("test before rotateQuest");
      
      var finished = this.get('finished');

      if(!finished){
        return ;
      }
      else {

      var angle = 0;
       setInterval(function(){
         angle+=1;
         
         $(".dialog-reward-bg").rotate(angle);
       },20);

        $(".dialog-reward-bg").animate({
            width: '2200px',
            height: '2200px',
            top: '-1100px',
            left: '-1100px'
        },1000)

        $(".quest-dialog-bg").animate({
            height: '500px',
            width: '1000px',
            top: '-250px',
            left: '-500px'
        },{
            duration: 600,
            easing: 'easeOutElastic'
        });

        $("quest-dialog-text").delay(300).animate({
            opacity: '1'
        },150)

        $("#quest-dialog-advisor").delay(300).animate({
            opacity: '1'
        },150)

        var c=450;
        var size=92;
        var rel=0;
        var random=250;
        var abstand=55;

        var liElements=document.getElementsByClassName('item');

        var r=Math.ceil(Math.random() * 100)+random;
        $('.quest-reward-item:nth-child(1) img').delay(c).animate({
            width: size+'px',
            height: size+'px',
            top: rel+'px',
            left: rel+'px',
            opacity: '1'
        }, {
            duration: r,
            easing: 'easeOutBack'
        });

        $('.quest-reward-item:nth-child(4) img').delay(c+abstand).animate({
            width: size+'px',
            height: size+'px',
            top: rel+'px',
            left: rel+'px',
            opacity: '1'
        }, {
            duration: r,
            easing: 'easeOutBack'
        });

        if(liElements.length!=3){
            $('.quest-reward-item:nth-child(2) img').delay(c+abstand*2).animate({
                width: size+'px',
                height: size+'px',
                top: rel+'px',
                left: rel+'px',
                opacity: '1'
            }, {
                duration: r,
                easing: 'easeOutBack'
            });
        }

        $('.quest-reward-item:nth-child(3) img').delay(c+abstand*3).animate({
            width: size+'px',
            height: size+'px',
            top: rel+'px',
            left: rel+'px',
            opacity: '1'
        }, {
            duration: r,
            easing: 'easeOutBack'
        });

        if(liElements.length==3){
            $('.quest-reward-item:nth-child(2) img').delay(c+abstand*4).animate({
                width: size+'px',
                height: size+'px',
                top: rel+'px',
                left: rel+'px',
                opacity: '1'
            }, {
                duration: r,
                easing: 'easeOutBack'
            });
        }

        c=c+400;

        var bottomFE=40;

        $(".quest-reward-item:nth-child(1) .number").delay(c).animate({
            fontSize: '42px',
            bottom: bottomFE+'px',
            left:'0'
        },{
            duration: 150,
            easing: 'easeOutBack'
        });

        $(".quest-reward-item:nth-child(4) .number").delay(c+abstand).animate({
            fontSize: '42px',
            bottom: bottomFE+'px',
            left:'0'
        },{
            duration: 150,
            easing: 'easeOutBack'
        });

        if(liElements.length!=3){
            $(".quest-reward-item:nth-child(2) .number").delay(c+abstand*2).animate({
                fontSize: '42px',
                bottom: bottomFE+'px',
                left:'0'
            },{
                duration: 150,
                easing: 'easeOutBack'
            });
        }

        $(".quest-reward-item:nth-child(3) .number").delay(c+abstand*3).animate({
            fontSize: '42px',
            bottom: bottomFE+'px',
            left:'0'
        },{
            duration: 150,
            easing: 'easeOutBack'
        });

        if(liElements.length==3){
            $(".quest-reward-item:nth-child(2) .number").delay(c+abstand*4).animate({
                fontSize: '42px',
                bottom: bottomFE+'px',
                left:'0'
            },{
                duration: 150,
                easing: 'easeOutBack'
            });
        }

        $(".quest-dialog-button").delay(c).animate({
            width: '172px',
            height: '129px',
            top: '70.2%',
            left: '62%'
        }, {
            duration: 250,
            easing: 'easeOutBack'
       
    })
   console.log("test after rotateQuest");
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

  module.TutorialEndDialog = module.InfoDialog.extend({
    templateName: 'tutorial-end-dialog',

    okPressed: function() {
      var self = this;
      self.set('redeeming', true);
      AWE.GS.TutorialStateManager.redeemTutorialEndRewards(function() {
        self.destroy();
      }, function() {
        self.set('redeeming', false);
        var dialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('tutorial.end.redeemError.header'),
          message: AWE.I18n.lookupTranslation('tutorial.end.redeemError.message'),

          okPressed: function() {
            self.destroy();
            this._super();
          },
        });
        WACKADOO.presentModalDialog(dialog);
      });
    },
  });

  module.UIMarker = Ember.View.extend({
    templateName: 'ui-marker',

    animate: function() {
      var self = this;
      var arrow = this.$().find('.ui-marker-image')[0];

      switch(this.get('direction')) {
        case 0:
          $(arrow).animate({top: "+=48px"}, 500, function() {
            $(arrow).animate({top: "-=48px"}, 500, function() {
              self.animate();
            });
          });
          break;
        case 1:
          $(arrow).animate({left: "-=48px"}, 500, function() {
            $(arrow).animate({left: "+=48px"}, 500, function() {
              self.animate();
            });
          });
          break;
        case 2:
          $(arrow).animate({top: "-=48px"}, 500, function() {
            $(arrow).animate({top: "+=48px"}, 500, function() {
              self.animate();
            });
          });
          break;
        case 3:
          $(arrow).animate({left: "+=48px"}, 500, function() {
            $(arrow).animate({left: "-=48px"}, 500, function() {
              self.animate();
            });
          });
          break;
        default:
      }
    },

    didInsertElement: function() {
      this.animate();
    },

    top: 0,
    left: 0,

    style: function() {
      return "top: " + this.get('top') + "px; left: " + this.get('left') + "px;";
    }.property('top', 'left').cacheable(),

    direction: 0,

    directionClass: function() {
      switch (this.get('direction')) {
        case 0:
          return 'up';
        case 1:
          return 'right';
        case 2:
          return 'down';
        default:
          return 'left';
      }
    }.property('direction').cacheable(),
  });

  return module;
    
}(AWE.UI.Ember || {}));