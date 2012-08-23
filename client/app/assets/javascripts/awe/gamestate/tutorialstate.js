/* Author: Patrick Fox <patrick@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.TUTORIAL_STATUS_NEW        = 0; 
  module.TUTORIAL_STATUS_DISPLAYED  = 1;
  module.TUTORIAL_STATUS_FINISHED   = 2;
  module.TUTORIAL_STATUS_CLOSED     = 3;
        
  module.TutorialStateAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   TUTORIAL STATE
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.TutorialState = module.Entity.extend({     // extends Entity to Tutorial State
    typeName: 'TutorialState',          ///< identifies instances of this type
    
    character_id: null,
    tutorial: null,
    rules: null,
    
    init: function(spec) {
      this._super(spec);      
      this.set('tutorial', AWE.GS.TutorialManager.getTutorial());
      log('---> init tutorialState and rules', this.get('tutorial'));
    },
    
    // new, not displayed quests
    newQuestStates: function() {
      var questStates = this.getPath('quests.content');   // hier
      var newQuestStates = [];
      AWE.Ext.applyFunction(questStates, function(questState) {
        if (questState && questState.get('status') === module.TUTORIAL_STATUS_NEW) {
          newQuestStates.push(questState);
        }
      });
      return newQuestStates;
    }.property('quests.@each').cacheable(),    

    // displayed quests, that aren't finished
    openQuestStates: function() {
      var questStates = this.getPath('quests.content');
      var openQuestStates = [];
      AWE.Ext.applyFunction(questStates, function(questState) {
        if (questState && questState.get('status') <= module.TUTORIAL_STATUS_DISPLAYED) {
          openQuestStates.push(questState);
        }
      });
      return openQuestStates;
    }.property('quests.@each').cacheable(),    

    // finished quests, which resources aren't rewarded yet
    notClosedQuestStates: function() {
      var questStates = this.getPath('quests.content');
      var notClosedQuestStates = [];
      AWE.Ext.applyFunction(questStates, function(questState) {
        if (questState && questState.get('status') < module.TUTORIAL_STATUS_CLOSED) {
          notClosedQuestStates.push(questState);
        }
      });
      log('-----> Zugriff', notClosedQuestStates);
      return notClosedQuestStates;
    }.property('quests.@each').cacheable(),    
  });     

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   TUTORIAL QUEST STATE
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.QuestState = module.Entity.extend({
    typeName: 'QuestState',
    
    quest_id: null,
    status: null,
    started_at: null,
    finished_at: null,
    
    quest: function() {
      var questId = this.get('quest_id');
      if (questId === undefined || questId === null) {
        return null;
      }
      return AWE.GS.TutorialManager.getTutorial().quest(questId);      
    }.property('quest_id').cacheable(),
    
    questNr: function() {
      var questId = this.get('quest_id');
      if (questId === undefined || questId === null) {
        return null;
      }
      return questId + 1;
    }.property('quest_id').cacheable(),
    
    questNameBinding: 'quest.name',
    
    statusString: function() {
      switch (this.get('status')) {
        case module.TUTORIAL_STATUS_NEW:
        case module.TUTORIAL_STATUS_DISPLAYED:
          return AWE.I18n.lookupTranslation('tutorial.open');
        case module.TUTORIAL_STATUS_FINISHED:
          return AWE.I18n.lookupTranslation('tutorial.finished');
        default:
          return null;
      }
    }.property('status').cacheable(),
    
    finished: function() {
      return this.get('status') === module.TUTORIAL_STATUS_FINISHED;
    }.property('status').cacheable(),
    
    checkForRewards: function() {
      
      var self = this;
      
      log('---> check questState for rewards');
      
      // quest ausm tutorial holen
      var quest = AWE.GS.TutorialManager.getTutorial().quest(this.get('quest_id'));
      // alle checks des tutorialquests durchlaufen
      log('---> quest', quest, quest.reward_tests);
      
      // check all reward tests. if anyone fails, return false.
      if (quest.reward_tests) {
        if (quest.reward_tests.building_tests) {
          log('---> building_tests', quest.reward_tests.building_tests);
        
          for (var i = 0; i < quest.reward_tests.building_tests.length; i++) {
            var building_test = quest.reward_tests.building_tests[i];

            log('---> building_test', building_test);
            if (!self.checkBuildings(building_test)) {
              log('---> building_test failed');
              return false;              
            }
            log('---> building_test ok');
          }
        }
        if (quest.reward_tests.army_tests) {
          log('---> army_tests', quest.reward_tests.army_tests);
        
          for (var i = 0; i < quest.reward_tests.army_tests.length; i++) {
            var army_test = quest.reward_tests.army_tests[i];

            log('---> army_test', army_test);
            if (!self.checkArmies(army_test)) {
              log('---> army_test failed');
              return false;              
            }
            log('---> army_test ok');
          }
        }
        return true;
      }
      else {
        log('ERROR in AWE.GS.QuestState.checkForRewards: no reward tests given for quest type ' + this.get('quest_id'));
      }
    },
    
    
    checkBuildings: function(buildingTest) {
      log('---> checkBuildings', buildingTest);
      
      if (buildingTest.min_level == null || buildingTest.min_count == null) {
        log('ERROR in AWE.GS.QuestState.checkBuildings: buildingTest.min_level or buildingTest.min_count missing in quest id ' + this.get('quest_id'));
        return false;
      }
        
      var ownSettlements = AWE.GS.SettlementManager.getOwnSettlements();
      log('---> ownSettlements', ownSettlements);
      var checkCount = 0;

      AWE.Ext.applyFunctionToElements(ownSettlements, function(settlement) {
        var slots = settlement.slots();
        log('---> slots', slots);
        
        AWE.Ext.applyFunctionToElements(slots, function(slot) {
          var level = slot.get('level');
          var buildingId = slot.get('building_id');
          log('-----> ', level, buildingId);
          if (buildingId != null) {
            var buildingSymbolicId = AWE.GS.RulesManager.getRules().getBuildingType(buildingId)['symbolic_id'];
            if (buildingSymbolicId === buildingTest.building && level != null && level >= buildingTest.min_level) {
              checkCount++;
              log('-----> slot min_level test ok', buildingSymbolicId, level, buildingTest.min_level, checkCount, buildingTest.min_count);
            }
            else {
              log('-----> slot min_level test failed', buildingSymbolicId, level, buildingTest.min_level);
            }
          }
        });
      });
            
      return checkCount >= buildingTest.min_count;
    },
    
    checkArmies: function(armyTest) {
      log('---> checkArmies', armyTest);
      
      if (armyTest.min_count == null || armyTest.type == null) {
        log('ERROR in AWE.GS.QuestState.checkArmies: armyTest.min_count or armyTest.type missing in quest id ' + this.get('quest_id'));
        return false;
      }
        
      var armies = AWE.GS.ArmyManager.getArmiesOfCharacter(AWE.GS.player.getPath('currentCharacter.id'));
      log('---> armies', armies);
      
      var unitCount = 0;
      for (var id in armies) {
        if (armies.hasOwnProperty(id)) {
          var army = armies[id];
          log('---> army', army, army.isGarrison(), armyTest.type);
          if (army.isGarrison() && armyTest.type === 'garrison') {
            unitCount += army.get('size_present');
          }
          else if (!army.isGarrison() && armyTest.type === 'visible') {
            unitCount += army.get('size_present');
          }
        }
      }
      return unitCount >= armyTest.min_count;
    },
  });    


  // ///////////////////////////////////////////////////////////////////////
  //
  //   TUTORIAL STATE MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.TutorialStateManager = (function(my) {    // TutorialStateManager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;
    var lastTutorialStateUpdate = null;
    

    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    // my.runningUpdatesPerAllicance = {};///< hash that contains all running requests for alliances, using the alliance.id as key.
    my.runningUpdatesPerCharacterId = {};         ///< hash that contains all running requests for characters, using the id as key.

    my.createEntity = function(spec) {
      return module.TutorialState.create({
        quests: Ember.ArrayProxy.create({          
          baseTypeName: 'QuestState',
          content: Ember.A([]),
        }),
      });        
    }

  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
    
    that.tutorialState = null;
  
    that.getTutorialState = function() {
      return this.tutorialState;
    };
    
    that.lastUpdate = function() {
      return lastTutorialStateUpdate ? lastTutorialStateUpdate : new Date(1970);
    };
  
  
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateTutorialState = function(callback) {
      log('---> updateTutorialState');
      if (this.tutorialState) {
        var id = this.tutorialState.getId();
        var url = AWE.Config.TUTORIAL_SERVER_BASE + 'states/' + id;
        return my.updateEntity(url, id, AWE.GS.ENTITY_UPDATE_TYPE_FULL, callback);
      }
      else { // no tutorial state, need to fetch it
        var self = this;
        var characterId = AWE.GS.CharacterManager.getCurrentCharacter().getId();
        var url = AWE.Config.FUNDAMENTAL_SERVER_BASE + 'characters/' + characterId + '/tutorial_state';
        return my.fetchEntitiesFromURL(
          url, 
          my.runningUpdatesPerCharacterId, 
          characterId,
          AWE.GS.ENTITY_UPDATE_TYPE_FULL, 
          my.lastTutorialStateUpdate,
          function(state, statusCode, xhr, timestamp) {
            if (statusCode === AWE.Net.OK) {
              self.tutorialState = state;
              my.lastTutorialStateUpdate = timestamp;
            }
            if (callback) {
              callback(state, statusCode, xhr, timestamp);
            }
          }
        );
      }     
    }

    that.checkForRewards = function() {
      
      if (!AWE.Config.USE_TUTORIAL) return;

      log('---> checkForRewards');
      
      if (that.tutorialState) {
        var openQuestStates = that.tutorialState.get('openQuestStates');
        AWE.Ext.applyFunction(openQuestStates, function(questState) {
          if (questState.checkForRewards()) {
            log('---> checkForRewards', true);
            // action erzeugen und an server schicken
            var questCheckAction = AWE.Action.Tutorial.createCheckQuestAction(questState.get('quest_id'));
            questCheckAction.send(function(status) {
              if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
                // callback: dialog anzeigen mit reward
                var dialog = AWE.UI.Ember.QuestFinishedView.create({
                  // beim schließen:
                  // TS aktualisieren und neue quest anzeigen, falls vorhanden
                  quest: questState.get('quest'),
                              
                  okPressed:    function() {
                    that.checkForNewQuests();
                    this.destroy();
                  },            
                });          
                WACKADOO.presentModalDialog(dialog);
              }
              else {
                // TS aktualisieren und neue quest anzeigen, falls vorhanden            
                that.checkForNewQuests();
              }
            });
          }
          else {
            log('---> checkForRewards', false);
            that.checkForNewQuests();
          }
        });
      }
      else {
        log('ERROR in AWE.GS.TutorialManager.checkForRewards: missing tutorialState');
      }
    }
    
    that.checkForNewQuests = function() {
      
      if (!AWE.Config.USE_TUTORIAL) return;
      
      log('---> checkForNewQuests');
      
      that.updateTutorialState(function() {
      
        if (that.tutorialState) {
          var newQuestStates = that.tutorialState.get('newQuestStates');
          log('---> checkForNewQuests newQuestStates', newQuestStates);
          if (newQuestStates != null && newQuestStates.length > 0) {
            
            // only display first new quest, even if there are more. TODO implement overvie of new quests            
            var newQuestState = newQuestStates[0];
            
            // display newQuestStates[0];
            var dialog = AWE.UI.Ember.QuestStartedView.create({
              quest: newQuestState.get('quest'),
            });          
            WACKADOO.presentModalDialog(dialog);
            
            // send action that quest was displayed
            var questDisplayedAction = AWE.Action.Tutorial.createQuestDisplayedAction(newQuestState.getId());
            questDisplayedAction.send(function(status) {
              if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
                log('---> quest state set to displayed')
              }
              else {
                log('---> quest state could not be set to displayed')
              }
            });
          }
        }
        else {
          log('ERROR in AWE.GS.TutorialManager.checkForNewQuests: missing tutorialState');
        }
      });
    }    
    

    that.redeemRewards = function(questStateId) {
      
      log('---> redeemRewards', questStateId);
      
      var redeemRewardsAction = AWE.Action.Tutorial.createRedeemRewardsAction(questStateId);
      log('---> redeemRewards getRequestBody', redeemRewardsAction.getRequestBody());
      redeemRewardsAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          log('---> redeemRewards ok');
          that.updateTutorialState();
        }
        else {
          log('ERROR in AWE.GS.TutorialManager.redeemRewards');
        }
      });

    }
    
    return that;
  }());

  return module;
  
}(AWE.GS || {}));


