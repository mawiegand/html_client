/* Author: Patrick Fox <patrick@5dlab.com>,
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.QUEST_STATUS_NEW        = 0; 
  module.QUEST_STATUS_DISPLAYED  = 1;
  module.QUEST_STATUS_FINISHED   = 2;
  module.QUEST_STATUS_CLOSED     = 3;
        
  module.TutorialStateAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   TUTORIAL STATE
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.TutorialLocalState = Ember.Object.create({
    questsDisplayed: [],
  });
    
  module.TutorialState = module.Entity.extend({     // extends Entity to Tutorial State
    typeName: 'TutorialState',          ///< identifies instances of this type
    
    character_id: null,
    tutorial: null,
    rules: null,
    
    init: function(spec) {
      this._super(spec);      
      this.set('tutorial', AWE.GS.TutorialManager.getTutorial());
    },
    
    
    // TODO --> nach nr sortieren
    
    // new, not displayed quests
    newQuestStates: function() {
      // log('---> recalc newQuestStates');
      var questStates = this.getPath('quests.content');   // hier
      var newQuestStates = [];
      AWE.Ext.applyFunction(questStates, function(questState) {
        if (questState && questState.get('status') === module.QUEST_STATUS_NEW && questState.get('quest') && !questState.getPath('quest.hide_start_dialog')) {
          newQuestStates.push(questState);
        }
      });
      return newQuestStates;
    }.property('quests.@each.status').cacheable(),    

    // displayed quests, that aren't finished
    openQuestStates: function() {
      var questStates = this.getPath('quests.content');
      var openQuestStates = [];
      AWE.Ext.applyFunction(questStates, function(questState) {
        if (questState && questState.get('status') <= module.QUEST_STATUS_DISPLAYED) {
          openQuestStates.push(questState);
        }
      });
      return openQuestStates;
    }.property('quests.@each.status').cacheable(),
    
    openQuestStateCount: function() {
      return this.get('openQuestStates').length;
    }.property('quests.@each.status').cacheable(),

    // finished quests, which resources aren't rewarded yet
    notClosedQuestStates: function() {
      var questStates = this.getPath('quests.content');
      var notClosedQuestStates = [];
      AWE.Ext.applyFunction(questStates, function(questState) {
        if (questState && questState.get('status') < module.QUEST_STATUS_CLOSED && questState.get('quest') && (questState.getPath('quest.rewards') || questState.get('status') < module.QUEST_STATUS_FINISHED)) {
          notClosedQuestStates.push(questState);
        }
      });
      return notClosedQuestStates;
    }.property('quests.@each').cacheable(),
    
    notClosedQuestStateCount: function() {
      return this.get('notClosedQuestStates').length;
    }.property('quests.@each.status').cacheable(),

    closedQuestStates: function() {
      var questStates = this.getPath('quests.content');
      var closedQuestStates = [];
      AWE.Ext.applyFunction(questStates, function(questState) {
        if (questState && questState.get('status') === module.QUEST_STATUS_CLOSED) {
          closedQuestStates.push(questState);
        }
      });
      return closedQuestStates;
    }.property('quests.@each').cacheable(),
    
    closedQuestStateCount: function() {
      return this.get('closedQuestStates').length;
    }.property('quests.@each.status').cacheable(),

    questStateWithQuestId: function(questId) {
      var questStates = this.getPath('quests.content');
      // log('---> questStates', questStates);
      for (var i = 0; i < questStates.length; i++) {
        var questState = questStates[i];
        // log('---> questState', questState);
        if (questState != null && questState.get('quest_id') == questId) {
          return questState;
        }
      }
      return null;
    },
    
    newQuestCheckTimer: false,
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
    displayed_at: null,
    finished_at: null,
    closed_at: null,
    
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
        case module.QUEST_STATUS_NEW:
          return AWE.I18n.lookupTranslation('tutorial.new');
        case module.QUEST_STATUS_DISPLAYED:
          return AWE.I18n.lookupTranslation('tutorial.open');
        case module.QUEST_STATUS_FINISHED:
          return AWE.I18n.lookupTranslation('tutorial.finished');
        default:
          return null;
      }
    }.property('status').cacheable(),
    
    finished: function() {
      return this.get('status') === module.QUEST_STATUS_FINISHED;
    }.property('status').cacheable(),
    
    checkForRewards: function() {
      
      var self = this;
      
      // log('---> check questState for rewards');
      
      // quest ausm tutorial holen
      var quest = AWE.GS.TutorialManager.getTutorial().quest(this.get('quest_id'));
      // alle checks des tutorialquests durchlaufen
      // log('---> quest', quest, quest.reward_tests);
      
      // check all reward tests. if anyone fails, return false.
      if (quest && quest.reward_tests) {
        if (quest.reward_tests.building_tests) {
          // log('---> building_tests', quest.reward_tests.building_tests);
        
          for (var i = 0; i < quest.reward_tests.building_tests.length; i++) {
            var building_test = quest.reward_tests.building_tests[i];

            // log('---> building_test', building_test);
            if (!self.checkBuildings(building_test)) {
              // log('---> building_test failed');
              return false;              
            }
            // log('---> building_test ok');
          }
        }
        if (quest.reward_tests.settlement_tests) {
          // log('---> settlement_tests', quest.reward_tests.settlement_tests);
        
          for (var i = 0; i < quest.reward_tests.settlement_tests.length; i++) {
            var settlement_test = quest.reward_tests.settlement_tests[i];

            // log('---> settlement_test', settlement_test);
            if (!self.checkSettlements(settlement_test)) {
              // log('---> settlement_test failed');
              return false;              
            }
            // log('---> settlement_test ok');
          }
        }
        if (quest.reward_tests.army_tests) {
          // log('---> army_tests', quest.reward_tests.army_tests);
        
          for (var i = 0; i < quest.reward_tests.army_tests.length; i++) {
            var army_test = quest.reward_tests.army_tests[i];

            // log('---> army_test', army_test);
            if (!self.checkArmies(army_test)) {
              // log('---> army_test failed');
              return false;              
            }
            // log('---> army_test ok');
          }
        }
        if (quest.reward_tests.construction_queue_tests) {
          // log('---> construction_queue_tests', quest.reward_tests.construction_queue_tests);
        
          for (var i = 0; i < quest.reward_tests.construction_queue_tests.length; i++) {
            var construction_queue_test = quest.reward_tests.construction_queue_tests[i];

            // log('---> construction_queue_test', construction_queue_test);
            if (!self.checkConstructionQueues(construction_queue_test)) {
              // log('---> construction_queue_test failed');
              return false;              
            }
            // log('---> construction_queue_test ok');
          }
        }
        if (quest.reward_tests.training_queue_tests) {
          // log('---> training_queue_tests', quest.reward_tests.training_queue_tests);
        
          for (var i = 0; i < quest.reward_tests.training_queue_tests.length; i++) {
            var training_queue_test = quest.reward_tests.training_queue_tests[i];

            // log('---> training_queue_test', training_queue_test);
            if (!self.checkTrainingQueues(training_queue_test)) {
              // log('---> training_queue_test failed');
              return false;              
            }
            // log('---> training_queue_test ok');
          }
        }
        if (quest.reward_tests.movement_test) {
          // log('---> movement_test', quest.reward_tests.movement_test);
        
          if (!self.checkMovement(quest.reward_tests.movement_test)) {
            // log('---> movement_test failed');
            return false;              
          }
          // log('---> movement_test ok');
        }
        if (quest.reward_tests.alliance_test) {
          // log('---> alliance_test', quest.reward_tests.alliance_test);
        
          if (!self.checkAlliance(quest.reward_tests.alliance_test)) {
            // log('---> alliance_test failed');
            return false;              
          }
          // log('---> alliance_test ok');
        }
        if (quest.reward_tests.textbox_test) {
          // log('---> textbox_test');
          // log('---> textbox_test failed');
          return false;                   // textbox tests are always checked manually with another method
        }
        if (quest.reward_tests.custom_test) {
          // log('---> custom_test');
          // log('---> custom_test failed');
          return false;                    // custom tests are always checked manually with another method
        }
        return true;
      }
      else {
        log('ERROR in AWE.GS.QuestState.checkForRewards: no quest or reward tests given for quest type ' + this.get('quest_id'));
      }
    },
    
    
    checkBuildings: function(buildingTest) {
      // log('---> checkBuildings', buildingTest);
      
      if (buildingTest.min_level == null || buildingTest.min_count == null) {
        log('ERROR in AWE.GS.QuestState.checkBuildings: buildingTest.min_level or buildingTest.min_count missing in quest id ' + this.get('quest_id'));
        return false;
      }
        
      var ownSettlements = AWE.GS.SettlementManager.getOwnSettlements();
      // log('---> ownSettlements', ownSettlements);
      var checkCount = 0;

      AWE.Ext.applyFunctionToElements(ownSettlements, function(settlement) {
        var slots = settlement.slots();
        // log('---> slots', slots);
        
        AWE.Ext.applyFunctionToElements(slots, function(slot) {
          var level = slot.get('level');
          var buildingId = slot.get('building_id');
          // log('-----> ', level, buildingId);
          if (buildingId != null) {
            var buildingSymbolicId = AWE.GS.RulesManager.getRules().getBuildingType(buildingId)['symbolic_id'];
            if (buildingSymbolicId === buildingTest.building && level != null && level >= buildingTest.min_level) {
              checkCount++;
              // log('-----> slot min_level test ok', buildingSymbolicId, level, buildingTest.min_level, checkCount, buildingTest.min_count);
            }
            else {
              // log('-----> slot min_level test failed', buildingSymbolicId, level, buildingTest.min_level);
            }
          }
        });
      });
            
      // log('---> building count', checkCount, buildingTest.min_count);
      return checkCount >= buildingTest.min_count;
    },

    checkSettlements: function(settlementTest) {
      // log('---> checkSettlements', settlementTest);

      if (settlementTest.min_count == null || settlementTest.type == null) {
        log('ERROR in AWE.GS.QuestState.checkSettlements: settlementTest.min_count or settlementTest.type missing in quest id ' + this.get('quest_id'));
        return false;
      }

      var settlementType = AWE.GS.RulesManager.getRules().getSettlementTypeWithSymbolicId(settlementTest.type);
        
      // log('---> settlements', AWE.GS.SettlementManager.getOwnSettlementsOfType(settlementType.id), settlementTest.min_count, settlementTest.type, settlementType);
      return AWE.Util.hashCount(AWE.GS.SettlementManager.getOwnSettlementsOfType(settlementType.id)) >= settlementTest.min_count
    },
        
    checkArmies: function(armyTest) {
      // log('---> checkArmies', armyTest);
      
      if (armyTest.min_count == null || armyTest.type == null) {
        log('ERROR in AWE.GS.QuestState.checkArmies: armyTest.min_count or armyTest.type missing in quest id ' + this.get('quest_id'));
        return false;
      }
        
      var armies = AWE.GS.ArmyManager.getArmiesOfCharacter(AWE.GS.player.getPath('currentCharacter.id'));
      // log('---> armies', armies);
      
      var unitCount = 0;
      for (var id in armies) {
        if (armies.hasOwnProperty(id)) {
          var army = armies[id];
          // log('---> army', army, army.isGarrison(), armyTest.type);
          if (army.isGarrison() && armyTest.type === 'garrison') {
            unitCount += army.get('size_present');
          }
          else if (!army.isGarrison() && armyTest.type === 'visible') {
            unitCount += army.get('size_present');
          }
        }
      }
      // log('---> units', unitCount, armyTest.min_count);
      return unitCount >= armyTest.min_count;
    },

    checkConstructionQueues: function(queueTest) {
      // log('---> checkConstructionQueues', queueTest);
      
      if (queueTest.min_count == null) {
        log('ERROR in AWE.GS.QuestState.checkConstructionQueues: queueTest.min_count missing in quest id ' + this.get('quest_id'));
        return false;
      }
        
      var ownSettlements = AWE.GS.SettlementManager.getOwnSettlements();
      // log('---> ownSettlements', ownSettlements);
      var checkCount = 0;

      AWE.Ext.applyFunctionToElements(ownSettlements, function(settlement) {
        var queues = settlement.queues();
        // log('---> queues', queues);
        
        AWE.Ext.applyFunctionToElements(queues, function(queue) {
          if (queue) {
            // log('---> queue', queue);
            var jobs = AWE.GS.ConstructionJobManager.getJobsInQueue(queue.getId());
            // log('---> jobs', jobs);
          
            AWE.Ext.applyFunctionToElements(jobs, function(job) {
              if (job) {
                // log('---> job', job);
                var jobType = job.get('job_type'); // CONSTRUCTION_JOB_TYPE_CREATE
                var buildingId = job.get('building_id');
                // log('-----> ', jobType, buildingId);
                if (buildingId != null && jobType != null) {
                  var buildingSymbolicId = AWE.GS.RulesManager.getRules().getBuildingType(buildingId)['symbolic_id'];
                  if (buildingSymbolicId === queueTest.building && (jobType == AWE.GS.CONSTRUCTION_JOB_TYPE_CREATE || jobType == AWE.GS.CONSTRUCTION_JOB_TYPE_UPGRADE)) {
                    checkCount++;
                    // log('-----> job min_count test ok', buildingSymbolicId, checkCount, queueTest.min_count);
                  }
                  else {
                    // log('-----> job min_count test failed', buildingSymbolicId);
                  }
                }
              }
            });
          }
        });
      });
            
      // log('---> job count', checkCount, queueTest.min_count);
      return checkCount >= queueTest.min_count;
    },

    checkTrainingQueues: function(queueTest) {
      // log('---> checkTrainingQueues', queueTest);
      
      if (queueTest.min_count == null) {
        log('ERROR in AWE.GS.QuestState.checkTrainingQueues: queueTest.min_count missing in quest id ' + this.get('quest_id'));
        return false;
      }
        
      var ownSettlements = AWE.GS.SettlementManager.getOwnSettlements();
      // log('---> ownSettlements', ownSettlements);
      var checkCount = 0;

      AWE.Ext.applyFunctionToElements(ownSettlements, function(settlement) {
        var trainingQueues = settlement.trainingQueues();
        // log('---> trainingQueues', trainingQueues);
        
        AWE.Ext.applyFunctionToElements(trainingQueues, function(trainingQueue) {
          if (trainingQueue) {
            // log('---> trainingQueue', trainingQueue);
            var jobs = AWE.GS.TrainingJobManager.getJobsInQueue(trainingQueue.getId());
            // log('---> jobs', jobs);
          
            AWE.Ext.applyFunctionToElements(jobs, function(job) {
              if (job) {
                // log('---> job', job);
                var unitId = job.get('unit_id');
                // log('-----> ', unitId);
                if (unitId != null) {
                  var unitSymbolicId = AWE.GS.RulesManager.getRules().getUnitType(unitId)['db_field'];
                  if (unitSymbolicId === queueTest.unit) {
                    checkCount++;
                    // log('-----> job min_count test ok', unitSymbolicId, checkCount, queueTest.min_count);
                  }
                  else {
                    // log('-----> job min_count test failed', unitSymbolicId);
                  }
                }
              }
            });
          }
        });
      });
            
      // log('---> job count', checkCount, queueTest.min_count);
      return checkCount >= queueTest.min_count;
    },
    
    checkMovement: function() {
      // log('---> checkcheckMovement');
      var armies = AWE.GS.ArmyManager.getArmiesOfCharacter(AWE.GS.player.getPath('currentCharacter.id'));
      
      if (armies != null) {
        for (var id in armies) {
          if (armies.hasOwnProperty(id) && armies[id].get('mode') == AWE.Config.ARMY_MODE_MOVING) {
              return true;
          }
        }
      }
      return false;
    },

    checkAlliance: function() {
      // log('---> checkAlliance');
      return AWE.GS.player.getPath('currentCharacter.alliance_id') != null;
    },

    checkTextbox: function(textboxTest, answerText) {
      // log('---> checkTextbox with answer', textboxTest, answerText);
      
      var testId = textboxTest.id;
      
      if (testId == null) {
        log('ERROR in AWE.GS.QuestState.checkTextbox: textboxTest.id missing in quest id ' + this.get('quest_id'));
        return false;
      }
        
      if (testId === 'test_army_rank') {
        return true;
      }
      
      if (testId === 'test_fortress_owner') {
        return true;
      }
      
      if (testId === 'test_costs') {
        var buildingType = AWE.GS.RulesManager.getRules().getBuildingTypeWithSymbolicId('building_barracks');
        var resourceType = AWE.GS.RulesManager.getRules().getResourceTypeWithSymbolicId('resource_wood');
        var formula = buildingType['costs'][resourceType['id']];
        var amount = Math.ceil(AWE.GS.Util.parseAndEval(formula, 2));
        // log('-----> 1234 ', buildingType, resourceType, formula, amount,  amount + "", answerText);
        return amount + "" == answerText;
      }
      
      if (testId === 'test_recruit_friends_reward') {
        return true;
      }
      
      return false;      
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
    var lastTutorialStateUpdate = new Date(1970);
    
    var lastRewardsCheck = new Date(1970);
    var checking = false;
    var delayedFinishedQuestState = null;
    var delayedStartQuestState = null;

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
      // log('---> updateTutorialState');
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
          lastTutorialStateUpdate,
          function(state, statusCode, xhr, timestamp) {
            if (statusCode === AWE.Net.OK) {
              self.tutorialState = state;
              lastTutorialStateUpdate = timestamp;
            }
            if (callback) {
              callback(state, statusCode, xhr, timestamp);
            }
          }
        );
      }     
    }

    that.tutorialEnabled = function() {
      return AWE.Config.USE_TUTORIAL && that.tutorialState != null;
    }

    that.triggerTutorialChecks = function() {
      
      if (!that.tutorialEnabled()) return;
      log('---> triggerTutorialChecks');
      
      if (!WACKADOO.modalDialogOpen() &&
          lastRewardsCheck.getTime() + 3000 < new Date().getTime()) { // timeout
        lastRewardsCheck = new Date();
        log('---> triggerTutorialChecks: start checking');
        
        if (delayedFinishedQuestState) {
          // show finished dialog
          log('---> triggerTutorialChecks: show delayed finished dialog');
          that.showQuestFinishedDialog(delayedFinishedQuestState);
          delayedFinishedQuestState = null;
        }
        else if (delayedStartQuestState) {
          // show start dialog
          log('---> triggerTutorialChecks: show delayed start dialog');
          that.showQuestStartDialog(delayedStartQuestState);
          delayedStartQuestState = null;
        }
        else {
          log('---> triggerTutorialChecks: check for rewards');
          that.checkForRewards2();
        }
      }
      
      if (that.tutorialState.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {
        that.updateTutorialState();
      }
      
      if (AWE.GS.TutorialManager.getTutorial().lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 300000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {
        AWE.GS.TutorialManager.updateTutorial();
      }
    };

    that.checkForRewards2 = function() {
      
      if (!that.tutorialEnabled()) return;

      log('---> checkForRewards');

      checking = true;
      var openQuestStates = that.tutorialState.get('openQuestStates');
      var success = false;
      AWE.Ext.applyFunction(openQuestStates, function(questState) {
        if (questState.checkForRewards()) {
          success = true;
          log('---> checkForRewards', true);
          // action erzeugen und an server schicken
          var questCheckAction = AWE.Action.Tutorial.createCheckQuestAction(questState.get('quest_id'));
          questCheckAction.send(function(status) {
            if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
              // callback: dialog anzeigen mit reward
              questState.set('status', AWE.GS.QUEST_STATUS_FINISHED);
              log('---> checkForRewards modalDialogOpen', WACKADOO.modalDialogOpen());
              if (!WACKADOO.modalDialogOpen()) {
                that.showQuestFinishedDialog(questState);
              }
              else {
                delayedFinishedQuestState = questState;
                checking = false;
                log('---> stop checking in checkForRewards2, modal');
              }
            }
            else {
              checking = false;
              log('---> stop checking in checkForRewards2, !AWE.Net.OK');
            }
          });
        }
        else {
          log('---> checkForRewards', false);
        }
      });

      if (!success) {
        that.showNextNewQuest();
      }
    }
    
    that.stopChecking = function() {
      checking = false;
      // log('---> stop checking with stopChecking method');
    }
    
    that.checkForCustomTestRewards = function(questName) {
      
      if (!that.tutorialEnabled()) return;

      checking = true;
      // quest finden
      var quest = AWE.GS.TutorialManager.getTutorial().questWithSymbolicId(questName);
      log('-----> checkForCustomTestRewards 1', questName, quest);
      
      if (quest) {
        // questState finden
        var questState = AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(quest['id']);
        log('---> checkForCustomTestRewards 2', quest, questState);
        
        if (questState && questState.get('status') <= AWE.GS.QUEST_STATUS_DISPLAYED) {
          // action erzeugen und an server schicken
          log('---> checkForCustomTestRewards action sent');
          var questCheckAction = AWE.Action.Tutorial.createCheckQuestAction(questState.get('quest_id'));
          questCheckAction.send(function(status) {
            if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
              // callback: dialog anzeigen mit reward
              questState.set('status', AWE.GS.QUEST_STATUS_FINISHED);
              log('---> checkForRewards modalDialogOpen', WACKADOO.modalDialogOpen());
              if (!WACKADOO.modalDialogOpen()) {
                that.showQuestFinishedDialog(questState);
              }
              else {
                delayedFinishedQuestState = questState;
                checking = false;
                log('---> stop checking in checkForCustomTestRewards, modal');
              }
            }
            else {
              checking = false;
              log('---> stop checking in checkForCustomTestRewards, !AWE.Net.OK');
            }
          });
        }
        else {
          checking = false;
          log('---> stop checking in checkForCustomTestRewards, questState.get(status) > AWE.GS.QUEST_STATUS_DISPLAYED');
        }
      }
      else {
        log('ERROR in AWE.GS.TutorialManager.checkForCustomTestRewards: missing quest');
        checking = false;
        log('---> stop checking in checkForCustomTestRewards, ERROR');
      }
    }
    
    that.checkForNewQuests = function() {
      
      if (!that.tutorialEnabled()) return;
      
      log('---> checkForNewQuests');

      checking = true;
      that.updateTutorialState(function() {
        if (that.tutorialState) {
          that.showNextNewQuest();
        }
        else {
          log('ERROR in AWE.GS.TutorialManager.checkForNewQuests: missing tutorialState');
          checking = false;
          log('---> stop checking in checkForNewQuests, ERROR');
        }
      });
    }      

    that.showNextNewQuest = function() {
      var newQuestStates = that.tutorialState.get('newQuestStates');
      log('---> showNextNewQuest: newQuestStates', newQuestStates);
      if (newQuestStates != null && newQuestStates.length > 0) {
        
        // only display first new quest, even if there are more. the other quest will be displayed later on.            
        var newQuestState = newQuestStates[0];
          
        if (newQuestState.get('quest') != null && !newQuestState.getPath('quest.hide_start_dialog')) {
          log('---> showNextNewQuest: hide_start_dialog', false);
          if (WACKADOO.modalDialogOpen()) {
            log('---> showNextNewQuest: delay start dialog');
            delayedStartQuestState = newQuestState;
            checking = false;
            log('---> stop checking in showNextNewQuest, modal');
          }
          else {
            log('---> showNextNewQuest: show dialog');
            that.showQuestStartDialog(newQuestState);
          }
        }
        else {
          checking = false;
          log('---> stop checking in checkForNewQuests, hide_start_dialog');
        }   
      }
      else {
        checking = false;
        log('---> stop checking in checkForNewQuests, newQuestStates == null');
      }
    }

    that.redeemRewards = function(questState, success, error) {
      
      if (!that.tutorialEnabled()) return;

      log('---> redeemRewards', questState);
      
      var redeemRewardsAction = AWE.Action.Tutorial.createRedeemRewardsAction(questState.getId());
      log('---> redeemRewards getRequestBody', redeemRewardsAction.getRequestBody());
      redeemRewardsAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          log('---> redeemRewards ok');
          that.updateTutorialState();
          if (success) {
            success();
          }
        }
        else if (status === AWE.Net.CONFLICT) {
          if (error) {
            error();
          }
          var dialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('tutorial.quest.redeemError.header'),
            message: AWE.I18n.lookupTranslation('tutorial.quest.redeemError.message'),
          });          
          WACKADOO.presentModalDialog(dialog);
        }
        else {
          log('ERROR in AWE.GS.TutorialManager.redeemRewards');
        }
      });
    }    
    
    that.showQuestStartDialog = function(questState) {
      
      if (!that.tutorialEnabled()) return;

      log('---> showQuestInfoDialog ', AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')], questState.get('status'));
      
      if (AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')] !== true &&
          questState.get('status') === AWE.GS.QUEST_STATUS_NEW) {
        checking = true;
        var dialog = AWE.UI.Ember.QuestDialog.create({
          questState: questState,
          header: AWE.I18n.lookupTranslation('tutorial.quest.start.header'),
          okPressed:    function() {
            this.destroy();
            log('---> checkForNewQuests: set displayed');
            checking = false;
            log('---> stop checking in showQuestStartDialog, close dialog');
          },            
        });
        WACKADOO.presentModalDialog(dialog);

        that.setQuestDisplayed(questState);
      }
    }
    
    that.showQuestInfoDialog = function(quest) {
      
      if (!that.tutorialEnabled()) return;

      log('---> showQuestInfoDialog');
      
      var questState = AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(quest.id);
      var infoDialog = AWE.UI.Ember.QuestDialog.create({
        header: AWE.I18n.lookupTranslation('tutorial.quest.info.header'),
        questState: questState,
      });
      WACKADOO.presentModalDialog(infoDialog);      

      if (questState.get('status') === AWE.GS.QUEST_STATUS_NEW) {      
        that.setQuestDisplayed(questState);
      }
    }
    
    that.showQuestFinishedDialog = function(questState) {
      
      if (!that.tutorialEnabled()) return;

      log('---> showQuestFinishedDialog');

      checking = true;
      var dialog = AWE.UI.Ember.QuestDialog.create({
        header: AWE.I18n.lookupTranslation('tutorial.quest.end.header'),
        questState: questState,
        okPressed: function() {
          this.destroy();
          that.checkForNewQuests();
        },            
      });          
      WACKADOO.presentModalDialog(dialog);
    }
    
    that.setQuestDisplayed = function(questState) {
      log('---> setQuestDisplayed before setting to displayed', questState.get('quest_id'), questState.get('status'), AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')])
      questState.set('status', AWE.GS.QUEST_STATUS_DISPLAYED);
      AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')] = true;
      log('---> setQuestDisplayed after setting to displayed', questState.get('quest_id'), questState.get('status'), AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')])
      var questDisplayedAction = AWE.Action.Tutorial.createQuestDisplayedAction(questState.getId());
      questDisplayedAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          log('---> quest state set to displayed')
        }
        else {
          log('---> quest state could not be set to displayed')
        }
      });
    }

    that.checkForRewards = function() {
    };

    return that;
  }());

  return module;
  
}(AWE.GS || {}));
