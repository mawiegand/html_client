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



    showQuestInfoPressed: function(quest) {
      console.log('--> show Quest Info Button Pressed', quest)
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



    showQuestInfoPressed: function() {
       console.log('---> QuestListEntryView showQuestInfoPressed', this.getPath('questState.quest'));
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
        this.destroy();
      }
    },

    showDescriptonButtonPressed: function() {
      AWE.GS.TutorialStateManager.showQuestDescriptionDialog(this.get('quest'));
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
      var compressedVersion = $(window).width() < 1024; // that's not a good option! may run in window / frame / div
      var self = this;
    

      if (popupAnimations) {

        // prepare the dialog for animation
        self.$('.quest-dialog-text > *').hide();
        // TODO: set sizes to zero


        if (!compressedVersion) {
          self.$(".dialog-reward-bg-leafs").delay(100).animate({
            width: '977px',
            height: '493px',
            left: '-487px',
            top: '-9px'
          },{
            duration: 800,
            easing: 'easeOutElastic'
          });
        }
        
        self.$(".quest-dialog-bg").delay(100).animate({
          height: '477px',
          width: '650px',
          top: '0px',
          left: '-325px'
        }, {
          duration: 800,
          easing: 'easeOutElastic',
          complete: function() {

            var random  = 250;
            var abstand = 250;
            var base    = 100;

            self.$('.quest-dialog-text > *').show();

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
              width: '26.5%',
              height: '27.1%',
              top: '69%',
              left: '70%'
            }, {
              duration: 250,
              easing: 'easeOutBack',
              complete: function() {
                if (spinningAnimation) {
                  self.set('spinningBackground', true);
                }
              }
            });
          },
        });
      }
      else {

        if (!compressedVersion) {
          self.$(".dialog-reward-bg-leafs").css({
            width: '977px',
            height: '493px',
            left: '-487px',
            top: '-9px'
          });
        }

        self.$(".quest-dialog-bg").css({
          height: '477px',
          width: '650px',
          top: '0px',
          left: '-325px'
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
          width: '26.5%',
          height: '27.1%',
          top: '69%',
          left: '70%'
        }, {
          duration: 250,
          easing: 'easeOutBack',
          complete: function() {
            if (spinningAnimation) {
              self.set('spinningBackground', true);
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

  module.QuestDescriptionDialog = module.InfoDialog.extend({
    templateName: 'quest-description-dialog',
    questBinding: 'questState.quest',
    quest: null,
    questState: null,

    okPressed: function() {
      this.destroy();
    }
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