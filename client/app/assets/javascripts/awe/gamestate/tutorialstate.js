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

  module.MARK_HOME_SETTLEMENT            = "mark_home_settlement";
  module.MARK_MAP                        = "mark_map";
  module.MARK_QUEST_BUTTON               = "mark_quest_button";
  module.MARK_PROFILE                    = "mark_profile";
  module.MARK_FREE_CONSTRUCTION_SLOT     = "mark_free_construction_slot";
  module.MARK_BUILDING_OPTION            = "mark_building_option";
  module.MARK_UPGRADABLE_BUILDING        = "mark_upgradable_building";
  module.MARK_UPGRADE_BUTTON             = "mark_upgrade_button";
  module.MARK_HURRY_BUTTON               = "mark_hurry_button";
  module.MARK_UNITS_BUTTON               = "mark_units_button";
  module.MARK_TRAINING_DIALOG_FLOW       = "mark_training_dialog_flow";
  module.MARK_NAME_CHANGE                = "mark_name_change";
  module.MARK_SELECT_OWN_HOME_SETTLEMENT = "mark_select_own_home_settlement";
  module.MARK_CREATE_ARMY                = "mark_create_army";
  module.MARK_CREATE_ARMY_DIALOG_FLOW    = "mark_create_army_dialog_flow";
  module.MARK_SELECT_OWN_ARMY            = "mark_select_own_army";
  module.MARK_SELECT_OTHER_ARMY          = "mark_select_other_army";
  module.MARK_MOVE_OWN_ARMY              = "mark_move_own_army";
  module.MARK_ATTACK_BUTTON              = "mark_attack_button";
  module.MARK_FIRST_STANDARD_ASSIGNMENT  = "mark_first_standard_assignment";

  module.TutorialStateAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   TUTORIAL STATE
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.TutorialLocalState = Ember.Object.create({
    questsDisplayed: [],
    lastUpdate: null,
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
      // log('---> recalc newQuestStates: all quest', questStates);
      var newQuestStates = [];
      AWE.Ext.applyFunction(questStates, function(questState) {
        if (questState && questState.get('status') === module.QUEST_STATUS_NEW && questState.get('quest') && !questState.getPath('quest.hide_start_dialog')) {
          // log('---> recalc newQuestStates: quest', questState.getId(), questState.get('status'), questState.get('updated_at'), questState.get('created_at'));
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

    closedQuestStateCountPlusOne: function() {
      return (this.get('closedQuestStateCount') || 0) + 1;
    }.property('closedQuestStateCount').cacheable(),

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

    activeTutorialQuestWithUIMarkers: function() {

      if (this.get('tutorial_finished')) {
        return null;
      }

      var openQuestStates = this.get('openQuestStates');
      var activeQuestState = null;

      AWE.Ext.applyFunction(openQuestStates, function(questState) {
        

        var quest = questState.get('quest');

        if (quest) {

        if (quest.tutorial) {
          var qPrio = quest.priority;
          var aPrio = activeQuestState ? activeQuestState.get('quest').priority : -1;

          var noFurtherUserInteraction = questState.checkNoFurtherUserInteractionRequired() && !questState.containsUIMarker(module.MARK_HURRY_BUTTON);

          // the quest may become active, iff
          // - its in the tutorial
          // - its either blocking (so blocks everything else until completed) or does need more user interaction
          // - and either there is no active quest
          //   - or the active quest has lower priority
          //   - or the active quest of same priority has a higher uid
          if (quest.tutorial &&
              (quest.blocking || !noFurtherUserInteraction) &&
              (!activeQuestState || qPrio > aPrio || (qPrio == aPrio && questState.getId() < activeQuestState.getId()))) {
            activeQuestState = questState;
          }
        }
        }
      });
      
      return activeQuestState;
    },

    activeUIMarkers: function() {
      var activeQuestState = this.activeTutorialQuestWithUIMarkers();

//      log('----> test ', (activeQuestState != null && activeQuestState.get('displayed_at') == null), (activeQuestState.checkNoFurtherUserInteractionRequired() && !activeQuestState.containsUIMarker(module.MARK_HURRY_BUTTON)));

      return activeQuestState == null ||
        activeQuestState.get('displayed_at') == null ||
        (activeQuestState.checkNoFurtherUserInteractionRequired() && !activeQuestState.containsUIMarker(module.MARK_HURRY_BUTTON)) ? null : activeQuestState.get('quest').uimarker;
    },

    hasActiveUIMarkers: function() {
      var activeUIMarkers = this.activeUIMarkers();
      return !this.get('tutorial_finished') && activeUIMarkers && AWE.Ext.isArray(activeUIMarkers) && activeUIMarkers.length > 0;
    },

    isUIMarkerActive: function(marker) {
      if (this.get('tutorial_finished')) {
        return false;
      }
      else {
        var activeUIMarkers = this.activeUIMarkers();
        if (activeUIMarkers && AWE.Ext.isArray(activeUIMarkers)) {
          for (var i = 0; i < activeUIMarkers.length; i++) {
            if (activeUIMarkers[i] == marker) {
              return true;
            }
          }
        }
        return false;
      }
    },

    buildingTypeOfMarkerTest: function() {
      var activeQuestState = this.activeTutorialQuestWithUIMarkers();
      var quest = activeQuestState.get('quest');

      var buildingId = null;
      if (quest.reward_tests.building_tests && quest.reward_tests.building_tests.length > 0) {
        var buildingSymbolicId = quest.reward_tests.building_tests[0].building;
        buildingId = AWE.GS.RulesManager.getRules().getBuildingTypeWithSymbolicId(buildingSymbolicId).id;
      }
      else if (quest.reward_tests.construction_queue_tests && quest.reward_tests.construction_queue_tests.length > 0) {
        var buildingSymbolicId = quest.reward_tests.construction_queue_tests[0].building;
        buildingId = AWE.GS.RulesManager.getRules().getBuildingTypeWithSymbolicId(buildingSymbolicId).id;
      }

      return buildingId;
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
    
    tutorialState: function() {
      return module.TutorialStateManager.getTutorialState();
    }.property('quest_id'),
    
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
      return questId;
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
      var quest = this.get('quest');
      // alle checks des tutorialquests durchlaufen
      // log('---> quest', quest, quest.reward_tests);
      
      // check all reward tests. if anyone fails, return false.
      if (quest && quest.reward_tests) {
        if (quest.reward_tests.resource_production_tests) {
        
          for (var i = 0; i < quest.reward_tests.resource_production_tests.length; i++) {
            var test = quest.reward_tests.resource_production_tests[i];

            // log('---> building_test', building_test);
            if (!self.checkResourceProduction(test)) {
              // log('---> building_test failed');
              return false;              
            }
            // log('---> building_test ok');
          }
        }
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
        if (quest.reward_tests.alliance_members_test) {
          // log('---> alliance_test', quest.reward_tests.alliance_test);

          if (!self.checkAllianceMembers(quest.reward_tests.alliance_members_test)) {
            // log('---> alliance_test failed');
            return false;
          }
          // log('---> alliance_test ok');
        }
        if (quest.reward_tests.standard_assignment_test) {
//          log('---> standard_assignment_test', quest.reward_tests.standard_assignment_test);

          if (!self.checkStandardAssignment(quest.reward_tests.standard_assignment_test)) {
//            log('---> standard_assignment_test failed');
            return false;
          }
//          log('---> standard_assignment_test ok');
        }
        if (quest.reward_tests.kill_test) {
          // log('---> kill_test', quest.reward_tests.kill_test);

          if (!self.checkKills(quest.reward_tests.kill_test)) {
            // log('---> kill_test failed');
            return false;
          }
          // log('---> kill_test ok');
        }
        if (quest.reward_tests.battle_test) {
          // log('---> battle_test', quest.reward_tests.battle_test);

          if (!self.checkBattle(quest.reward_tests.battle_test)) {
            // log('---> battle_test failed');
            return false;
          }
          // log('---> battle_test ok');
        }
        if (quest.reward_tests.army_experience_test) {
          // log('---> alliance_test', quest.reward_tests.alliance_test);
        
          if (!self.checkArmyExperience(quest.reward_tests.army_experience_test)) {
            // log('---> alliance_test failed');
            return false;              
          }
          // log('---> alliance_test ok');
        }
        if (quest.reward_tests.score_test) {
          // log('---> score_test', quest.reward_tests.score_test);
        
          if (!self.checkScore(quest.reward_tests.score_test)) {
            // log('---> score_test failed');
            return false;              
          }
          // log('---> score_test ok');
        }
        if (quest.reward_tests.settlement_production_test) {
          // log('---> settlement_production_test', quest.reward_tests.settlement_production_test);
        
          if (!self.checkSettlementProduction(quest.reward_tests.settlement_production_test)) {
            // log('---> settlement_production_test failed');
            return false;              
          }
          // log('---> settlement_production_test ok');
        }
        if (quest.reward_tests.building_speed_test) {
          // log('---> building_speed_test', quest.reward_tests.building_speed_test);

          if (!self.checkBuildingSpeed(quest.reward_tests.building_speed_test)) {
            // log('---> building_speed_test failed');
            return false;
          }
          // log('---> building_speed_test ok');
        }

        // don't need to check cross platform test, it's always true!

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
        return false;
      }
    },
    

    checkResourceProduction: function(test) {
      var pool = AWE.GS.ResourcePoolManager.getResourcePool();
      
      if (test.minimum == null) {
        log('ERROR in AWE.GS.QuestState.checkResourceProduction: minimum missing in quest id ' + this.get('quest_id'));
        return false;
      }

      return pool && (pool.get(test.resource + '_production_rate') || 0) >= test.minimum;
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
        
      var armies = AWE.GS.ArmyManager.getArmiesOfCharacter(AWE.GS.game.getPath('currentCharacter.id'));
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
      
      if (queueTest.min_count == null || queueTest.min_level == null) {
        log('ERROR in AWE.GS.QuestState.checkConstructionQueues: queueTest.min_level or queueTest.min_level missing in quest id ' + this.get('quest_id'));
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
                var level = job.get('level_after'); // CONSTRUCTION_JOB_TYPE_CREATE
                var buildingId = job.get('building_id');
                // log('-----> ', jobType, buildingId);
                if (buildingId != null && jobType != null) {
                  var buildingSymbolicId = AWE.GS.RulesManager.getRules().getBuildingType(buildingId)['symbolic_id'];
                  if (buildingSymbolicId === queueTest.building &&
                      (jobType == AWE.GS.CONSTRUCTION_JOB_TYPE_CREATE || jobType == AWE.GS.CONSTRUCTION_JOB_TYPE_UPGRADE) &&
                      level != null && level >= queueTest.min_level) {
                    checkCount++;
                    // log('-----> job min_count test ok', buildingSymbolicId, level, checkCount, queueTest.min_level, queueTest.min_count);
                  }
                  else {
                    // log('-----> job min_count test failed', buildingSymbolicId, level, checkCount, queueTest.min_level, queueTest.min_count);
                  }
                }
              }
            });
          }
        });
        
        var slots = settlement.slots();
        // log('---> slots', slots);
        
        AWE.Ext.applyFunctionToElements(slots, function(slot) {
          var level = slot.get('level');
          var buildingId = slot.get('building_id');
          // log('-----> ', level, buildingId);
          if (buildingId != null) {
            var buildingSymbolicId = AWE.GS.RulesManager.getRules().getBuildingType(buildingId)['symbolic_id'];
            if (buildingSymbolicId === queueTest.building &&
                level != null && level >= queueTest.min_level) {
              checkCount++;
              // log('-----> slot min_count test ok', buildingSymbolicId, level, checkCount, queueTest.min_level, queueTest.min_count);
            }
            else {
              // log('-----> slot min_count test failed', buildingSymbolicId, level, checkCount, queueTest.min_level, queueTest.min_count);
            }
          }
        });
      });

      // log('---> job count', checkCount, queueTest.min_level, queueTest.min_count);
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
      var armies = AWE.GS.ArmyManager.getArmiesOfCharacter(AWE.GS.game.getPath('currentCharacter.id'));
      // log('---> checkcheckMovement', armies);
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
      return AWE.GS.game.getPath('currentCharacter.alliance_id') != null;
    },

    checkAllianceMembers: function(allianceMembersTest) {
      // log('---> checkAllianceMembers', allianceMembersTest);

      if (allianceMembersTest.min_count == null) {
        log('ERROR in AWE.GS.QuestState.checkAllianceMembers: allianceMembersTest.min_count missing in quest id ' + this.get('quest_id'));
        return false;
      }

      var allianceId = AWE.GS.game.getPath('currentCharacter.alliance_id');
      if (allianceId) {
        var alliance = AWE.GS.AllianceManager.getAlliance(allianceId);
        if (alliance) {
          return alliance.get('members_count') >= allianceMembersTest.min_count;
        }
      }

      return false;
    },

    checkStandardAssignment: function() {
//      log('---> checkStandardAssignment');
      var assignments = AWE.GS.game.getPath('currentCharacter.enumerableStandardAssignments');

      if (assignments != null) {
        for (var id in assignments) {
          if (assignments.hasOwnProperty(id) && assignments[id] && assignments[id].get('isActive')) {
            return true;
          }
        }
      }
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

    checkKills: function(killTest) {
      var minUnits = killTest.min_units;
      // log('---> checkKills with min_units', minUnits);
      
      if (minUnits == null) {
        log('ERROR in AWE.GS.QuestState.testKills: killTest.min_units missing in quest id ' + this.get('quest_id'));
        return false;
      }
      // log('---> checkKills with min_units', minUnits, AWE.GS.game.getPath('currentCharacter.kills'));
        
      return AWE.GS.game.getPath('currentCharacter.kills') != null && AWE.GS.game.getPath('currentCharacter.kills') >= minUnits;
    },

    checkBattle: function() {
      // log('---> checkBattle');
      var armies = AWE.GS.ArmyManager.getArmiesOfCharacter(AWE.GS.game.getPath('currentCharacter.id'));

      if (armies != null) {
        for (var id in armies) {
          if (armies.hasOwnProperty(id) && armies[id].get('mode') == AWE.Config.ARMY_MODE_FIGHTING) {
            return true;
          }
        }
      }
      return false;
    },

    checkArmyExperience: function(armyExperienceTest) {
      var minExp = armyExperienceTest.min_experience;
      
      if (minExp == null) {
        log('ERROR in AWE.GS.QuestState.checkArmyExperience: armyExperienceTest.min_experience missing in quest id ' + this.get('quest_id'));
        return false;
      }
      // log('---> checkcheckArmyExperienceKills with min_experience', minExp);
        
      var armies = AWE.GS.ArmyManager.getArmiesOfCharacter(AWE.GS.game.getPath('currentCharacter.id'));
      
      if (armies != null) {
        for (var id in armies) {
          if (armies.hasOwnProperty(id) && armies[id].get('exp') !== null && armies[id].get('exp') >= minExp) {
            return true;
          }
        }
      }
      return false;
    },

    checkScore: function(scoreTest) {
      var minPopulation = scoreTest.min_population;
      
      if (minPopulation == null) {
        log('ERROR in AWE.GS.QuestState.testScore: scoreTest.min_population missing in quest id ' + this.get('quest_id'));
        return false;
      }
        
      return AWE.GS.game.getPath('currentCharacter.score') != null && AWE.GS.game.getPath('currentCharacter.score') >= minPopulation;
    },

    checkSettlementProduction: function(settlementProductionTest) {
      var minResources = settlementProductionTest.min_resources;
      
      if (minResources == null) {
        log('ERROR in AWE.GS.QuestState.checkSettlementProduction: settlementProductionTest.min_resources missing in quest id ' + this.get('quest_id'));
        return false;
      }
      
      var productionTestWeights = AWE.GS.TutorialManager.getTutorial().get('production_test_weights');
      // log('---> productionTestWeights', productionTestWeights);
        
      var ownSettlements = AWE.GS.SettlementManager.getOwnSettlements();
      // log('---> ownSettlements', ownSettlements);

      var check = false;

      AWE.Ext.applyFunctionToElements(ownSettlements, function(settlement) {
        var productions = settlement.get('resourceProductions');
        var resources = 0.0;
        // log('---> productions', productions);
        
        if (productions != null) {
          AWE.Ext.applyFunctionToElements(productions, function(production) {
            // log('---> resources', resources, productionTestWeights[production.resourceType.symbolic_id], production.resourceType.symbolic_id, production.get('base'));
            resources += parseFloat(production.get('rate')) * (productionTestWeights[production.resourceType.symbolic_id] || 0);
          });
        }
        
        if (resources >= minResources) {
          check = true;
        }
      });

      return check;
    },
   
    checkBuildingSpeed: function(speedTest) {
      
      if (speedTest.min_speed == null) {
        log('ERROR in AWE.GS.QuestState.checkBuildingSpeed: queueTest.min_speed missing in quest id ' + this.get('quest_id'));
        return false;
      }
        
      var ownSettlements = AWE.GS.SettlementManager.getOwnSettlements();

      for (var sid in ownSettlements) {
        if (ownSettlements.hasOwnProperty(sid) && ownSettlements[sid].get('isBase')) {
          var queues = ownSettlements[sid].queues();
          
          for (var i = 0; i < queues.length; i++) {
            if (queues[i].get('speed') >= speedTest.min_speed) {
              return true;
            }
          }
        }
      };
      
      return false;
    },

    containsUIMarker: function(needle) {
      var quest = this.get('quest');
      var markers = quest.uimarker;
      if (markers) {
        for (var i = 0; i < markers.length; i++) {
          var marker = markers[i];
          if (marker != null && marker === needle) {
            return true;
          }
        }
      }
      return false;
    },

    noFurtherUserInteractionNeeded: false,

    checkNoFurtherUserInteractionRequired: function() {

      if (this.get('noFurtherUserInteractionNeeded')) {
        return true;
      }

      var self = this;
      var quest = this.get('quest');

      if (quest && quest.reward_tests) {
        if (quest.reward_tests.building_tests) {
          // log('---> building_tests', quest.reward_tests.building_tests);

          for (var i = 0; i < quest.reward_tests.building_tests.length; i++) {

            var building_test = quest.reward_tests.building_tests[i];

            // log('---> building_test', building_test);
            // same params as in constructionQueueTest
            if (!self.checkConstructionQueues(building_test)) {
              // log('---> building_test failed');
              return false;
            }
            // log('---> building_test ok');
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

        if (quest.reward_tests.resource_production_tests) {

          for (var i = 0; i < quest.reward_tests.resource_production_tests.length; i++) {
            var test = quest.reward_tests.resource_production_tests[i];

            // log('---> building_test', building_test);
            if (!self.checkResourceProduction(test)) {
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

        if (quest.reward_tests.battle_test) {
          // log('---> battle_test', quest.reward_tests.battle_test);

          if (!self.checkBattle(quest.reward_tests.battle_test)) {
            // log('---> battle_test failed');
            return false;
          }
          // log('---> battle_test ok');
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

        if (quest.reward_tests.alliance_members_test) {
          // log('---> alliance_test', quest.reward_tests.alliance_test);

          if (!self.checkAllianceMembers(quest.reward_tests.alliance_members_test)) {
            // log('---> alliance_test failed');
            return false;
          }
          // log('---> alliance_test ok');
        }

        if (quest.reward_tests.standard_assignment_test) {
//          log('---> standard_assignment_test', quest.reward_tests.standard_assignment_test);

          if (!self.checkStandardAssignment(quest.reward_tests.standard_assignment_test)) {
//            log('---> standard_assignment_test failed');
            return false;
          }
//          log('---> standard_assignment_test ok');
        }

        if (quest.reward_tests.kill_test) {
          // log('---> kill_test', quest.reward_tests.kill_test);

          if (!self.checkKills(quest.reward_tests.kill_test)) {
            // log('---> kill_test failed');
            return false;
          }
          // log('---> kill_test ok');
        }

        if (quest.reward_tests.army_experience_test) {
          // log('---> alliance_test', quest.reward_tests.alliance_test);

          if (!self.checkArmyExperience(quest.reward_tests.army_experience_test)) {
            // log('---> alliance_test failed');
            return false;
          }
          // log('---> alliance_test ok');
        }

        if (quest.reward_tests.score_test) {
          // log('---> score_test', quest.reward_tests.score_test);

          if (!self.checkScore(quest.reward_tests.score_test)) {
            // log('---> score_test failed');
            return false;
          }
          // log('---> score_test ok');
        }

        if (quest.reward_tests.settlement_production_test) {
          // log('---> settlement_production_test', quest.reward_tests.settlement_production_test);

          if (!self.checkSettlementProduction(quest.reward_tests.settlement_production_test)) {
            // log('---> settlement_production_test failed');
            return false;
          }
          // log('---> settlement_production_test ok');
        }

        if (quest.reward_tests.building_speed_test) {
          // log('---> building_speed_test', quest.reward_tests.building_speed_test);

          if (!self.checkBuildingSpeed(quest.reward_tests.building_speed_test)) {
            // log('---> building_speed_test failed');
            return false;
          }
          // log('---> building_speed_test ok');
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
      }
      else {
        return false;
      }

      this.set('noFurtherUserInteractionNeeded', true);
      AWE.GS.TutorialLocalState.set('lastUpdate', new Date());
      return true;
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
      // log('---> triggerTutorialChecks');
      
      if (!WACKADOO.modalDialogOpen() &&
          lastRewardsCheck.getTime() + 3000 < new Date().getTime()) { // timeout
        lastRewardsCheck = new Date();
        // log('---> triggerTutorialChecks: start checking');
        
        if (delayedFinishedQuestState) {
          // show finished dialog
          // log('---> triggerTutorialChecks: show delayed finished dialog');
          that.showQuestFinishedDialog(delayedFinishedQuestState);
          delayedFinishedQuestState = null;
        }
        else if (delayedStartQuestState) {
          // show start dialog
          // log('---> triggerTutorialChecks: show delayed start dialog');
          that.showQuestStartDialog(delayedStartQuestState);
          delayedStartQuestState = null;
        }
        else {
          // log('---> triggerTutorialChecks: check for rewards');
          that.checkForRewards();
        }
      }
      
      if (that.tutorialState.lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 60000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {
        that.updateTutorialState();
      }
      
      if (AWE.GS.TutorialManager.getTutorial().lastUpdateAt(AWE.GS.ENTITY_UPDATE_TYPE_FULL).getTime() + 300000 < AWE.GS.TimeManager.estimatedServerTime().getTime()) {
        AWE.GS.TutorialManager.updateTutorial();
      }
    };

    that.checkForRewards = function() {
      
      if (!that.tutorialEnabled()) return;

      // log('---> checkForRewards');

      var openQuestStates = that.tutorialState.get('openQuestStates');
      var success = false;
      AWE.Ext.applyFunction(openQuestStates, function(questState) {
        if (questState.checkForRewards()) {
          success = true;
          // log('---> checkForRewards', true);
          // action erzeugen und an server schicken
          var questCheckAction = AWE.Action.Tutorial.createCheckQuestAction(questState.get('quest_id'));
          questCheckAction.send(function(status) {
            if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
              // callback: dialog anzeigen mit reward
              questState.set('status', AWE.GS.QUEST_STATUS_FINISHED);
              // log('---> checkForRewards modalDialogOpen', WACKADOO.modalDialogOpen());
              if (!WACKADOO.modalDialogOpen()) {
                that.showQuestFinishedDialog(questState);
              }
              else {
                delayedFinishedQuestState = questState;
                // log('---> stop checking in checkForRewards, modal');
              }
            }
            else {
              // log('---> stop checking in checkForRewards, !AWE.Net.OK');
            }
          });
        }
        else {
          // log('---> checkForRewards', false);
        }
      });

      if (!success) {
        that.showNextNewQuest();
      }
    }
        
    that.checkForCustomTestRewards = function(testId) {
      
      if (!that.tutorialEnabled()) return;

      // log('---> checkForCustomTestRewards');
        
      // questState finden
      var openQuestStates = that.tutorialState.get('openQuestStates');
      var openQuestState = null;
      AWE.Ext.applyFunction(openQuestStates, function(questState) {
        // log('---> checkForCustomTestRewards questState', questState, questState.get('quest'));
        var quest = questState.get('quest');
        if (quest && quest.reward_tests &&
            quest.reward_tests.custom_test &&
            quest.reward_tests.custom_test.id &&
            quest.reward_tests.custom_test.id == testId) {
          openQuestState = questState;
        }
      });
      // log('---> checkForCustomTestRewards found questState', openQuestState);
      
      if (openQuestState) {
        if (openQuestState && openQuestState.get('status') <= AWE.GS.QUEST_STATUS_DISPLAYED) {
          // action erzeugen und an server schicken
          // log('---> checkForCustomTestRewards action sent');
          var questCheckAction = AWE.Action.Tutorial.createCheckQuestAction(openQuestState.get('quest_id'));
          questCheckAction.send(function(status) {
            if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
              // callback: dialog anzeigen mit reward
              openQuestState.set('status', AWE.GS.QUEST_STATUS_FINISHED);
              // log('---> checkForRewards modalDialogOpen', WACKADOO.modalDialogOpen());
              if (!WACKADOO.modalDialogOpen()) {
                that.showQuestFinishedDialog(openQuestState);
              }
              else {
                delayedFinishedQuestState = openQuestState;
                // log('---> stop checking in checkForCustomTestRewards, modal');
              }
            }
            else {
              // log('---> stop checking in checkForCustomTestRewards, !AWE.Net.OK');
            }
          });
        }
        else {
          // log('---> stop checking in checkForCustomTestRewards, questState.get(status) > AWE.GS.QUEST_STATUS_DISPLAYED');
        }
      }
      else {
        log('NOTICE in AWE.GS.TutorialManager.checkForCustomTestRewards: no open quest found for id', testId);
        // log('---> stop checking in checkForCustomTestRewards, ERROR');
      }
    }
    
    that.checkForNewQuests = function() {
      
      if (!that.tutorialEnabled()) return;
      
      // log('---> checkForNewQuests');

      that.updateTutorialState(function() {
        if (that.tutorialState) {
          that.showNextNewQuest();
        }
        else {
          log('ERROR in AWE.GS.TutorialManager.checkForNewQuests: missing tutorialState');
          // log('---> stop checking in checkForNewQuests, ERROR');
        }
      });
    }      

    that.showNextNewQuest = function() {
      var newQuestStates = that.tutorialState.get('newQuestStates');
      // log('---> showNextNewQuest: newQuestStates', newQuestStates);
      if (newQuestStates != null && newQuestStates.length > 0) {
        
        // only display first new quest, even if there are more. the other quest will be displayed later on.            
        var newQuestState = newQuestStates[0];

        if (newQuestState.get('quest') != null && !newQuestState.getPath('quest.hide_start_dialog')) {
          // log('---> showNextNewQuest: hide_start_dialog', false);
          if (WACKADOO.modalDialogOpen()) {
            // log('---> showNextNewQuest: delay start dialog');
            delayedStartQuestState = newQuestState;
            // log('---> stop checking in showNextNewQuest, modal');
          }
          else {
            // log('---> showNextNewQuest: show dialog');
            that.showQuestStartDialog(newQuestState);
          }
        }
        else {
          // log('---> stop checking in checkForNewQuests, hide_start_dialog');
        }   
      }
      else {
        // log('---> stop checking in checkForNewQuests, newQuestStates == null');
      }
    }

    that.redeemRewards = function(questState, success, error) {
      
      if (!that.tutorialEnabled()) return;

      // log('---> redeemRewards', questState);
      
      var redeemRewardsAction = AWE.Action.Tutorial.createRedeemRewardsAction(questState.getId());
      // log('---> redeemRewards getRequestBody', redeemRewardsAction.getRequestBody());
      redeemRewardsAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          // log('---> redeemRewards ok');
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
          if (error) {
            error();
          }
          log('ERROR in AWE.GS.TutorialManager.redeemRewards');
        }
      });
    }    
    
    that.showQuestStartDialog = function(questState) {
      
      if (!that.tutorialEnabled()) return;

      // log('---> showQuestInfoDialog ', AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')], questState.get('status') === AWE.GS.QUEST_STATUS_NEW);
      
      if (AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')] !== true &&
          questState.get('status') === AWE.GS.QUEST_STATUS_NEW) {
        var dialog = AWE.UI.Ember.QuestDialog.create({
          questState: questState,
          modeStart: true, 
          okPressed:    function() {
            this.destroy();
            // log('---> checkForNewQuests: set displayed');
            // log('---> stop checking in showQuestStartDialog, close dialog');
          },            
        });
        WACKADOO.presentModalDialog(dialog);

        that.setQuestDisplayed(questState);
      }

      // HOTFIX
      else if (AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')] === true &&
          questState.get('status') === AWE.GS.QUEST_STATUS_NEW) {
        // log('---> questsDisplayed array and quest have different status: updating tutorial state');
        that.updateTutorialState();
      }
    };
    
    that.showQuestInfoDialog = function(quest) {
      
      if (!that.tutorialEnabled()) return;

      // log('---> showQuestInfoDialog');
      
      var questState = AWE.GS.TutorialStateManager.getTutorialState().questStateWithQuestId(quest.id);
      var infoDialog = AWE.UI.Ember.QuestDialog.create({
        modeExisting: true,
        questState: questState,
      });
      WACKADOO.presentModalDialog(infoDialog);      

      if (questState.get('status') === AWE.GS.QUEST_STATUS_NEW) {      
        that.setQuestDisplayed(questState);
      }
    }
    
    that.showQuestFinishedDialog = function(questState) {
      
      if (!that.tutorialEnabled()) return;

      // log('---> showQuestFinishedDialog');

      var dialog = AWE.UI.Ember.QuestDialog.create({
        modeEnd: true,
        questState: questState,
        okPressed: function() {
          that.checkForNewQuests();
          this._super();
        },     

        willDestroyElement: function() {
          // log('---> willDestroyElement', questState.getPath('quest.tutorial_end_quest'), AWE.GS.TutorialStateManager.getTutorialState().get('tutorial_completed'));
          if (questState.getPath('quest.tutorial_end_quest') && !AWE.GS.TutorialStateManager.getTutorialState().get('tutorial_completed')) {
            var dialog = AWE.UI.Ember.TutorialEndDialog.create();          
            WACKADOO.presentModalDialog(dialog);
          }
        },
      });          
      WACKADOO.presentModalDialog(dialog);
    }
    
    that.setQuestDisplayed = function(questState) {
      // log('---> setQuestDisplayed before setting to displayed', questState.get('quest_id'), questState.get('status'), AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')])
      questState.set('status', AWE.GS.QUEST_STATUS_DISPLAYED);
      AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')] = true;
      // log('---> setQuestDisplayed after setting to displayed', questState.get('quest_id'), questState.get('status'), AWE.GS.TutorialLocalState.questsDisplayed[questState.get('quest_id')])
      var questDisplayedAction = AWE.Action.Tutorial.createQuestDisplayedAction(questState.getId());
      questDisplayedAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          // log('---> quest state set to displayed')
          that.updateTutorialState(function() {
            questState.set('status', AWE.GS.QUEST_STATUS_DISPLAYED);
          });

        }
        else {
          // log('---> quest state could not be set to displayed')
        }
      });
    }

    that.redeemTutorialEndRewards = function(success, error) {
      
      if (!that.tutorialEnabled()) return;

      var redeemRewardsAction = AWE.Action.Tutorial.createRedeemTutorialEndRewardsAction();
      // log('---> redeemTutorialEndRewards getRequestBody', redeemRewardsAction.getRequestBody());
      redeemRewardsAction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          // log('---> redeemTutorialEndRewards ok');
          that.updateTutorialState();
          if (success) {
            success();
          }
        }
        else {
          if (error) {
            error();
          }
          log('ERROR in AWE.GS.TutorialManager.redeemRewards');
        }
      });
    }    
    
    return that;
  }());

  return module;
  
}(AWE.GS || {}));
