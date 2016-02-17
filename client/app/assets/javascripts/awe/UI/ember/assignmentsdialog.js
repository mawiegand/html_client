/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.AssignmentsInfoDialog = module.PopUpDialog.extend({
    templateName: 'assignments-dialog-info',
    classNames: ['assignments-dialog-info'],

    assignmentType: null,

    assignment_in_progress : false,

    init: function() {
      this._super();
      this.set('assignments', AWE.GS.game.getPath('currentCharacter.hashableStandardAssignments'));
      this.set('currentCharacter', AWE.GS.game.get('currentCharacter'));
    },

    open: function(){
      WACKADOO.presentModalDialog(this);
    },

    isInTutorial: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      if(tutorialState.isUIMarkerActive(AWE.GS.MARK_FIRST_STANDARD_ASSIGNMENT)){
        return true;
      }
      return false;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),
  });

  module.AssignmentNewInfoView = Ember.View.extend({
    templateName: 'assignments-dialog-view-new',

    assignmentType: null,

    assignment: function() {
      var self = this;
      var foundAssignment = null;
      this.getPath('parentView.assignments.collection').forEach(function(assignment) {
        if (self.get('assignmentType') && assignment.get('type_id') == self.get('assignmentType').id) {
          foundAssignment = assignment;
        }
      });
      return foundAssignment;
    }.property('assignmentType', 'parentView.assignments.changedAt').cacheable(),

    controller: null,

    starting: false,
    halving: false,

    isActive: function() {
      return this.get('assignment') && this.getPath('assignment.ended_at') != null;
    }.property('assignment.ended_at').cacheable(),

    isHalved: function() {
      return this.get('assignment') && this.getPath('assignment.halved_at') != null;
    }.property('assignment.halved_at').cacheable(),

    isFinished: function() {
      return this.get('assignment') && this.getPath('assignment.finished');
    }.property('assignment.finished'),

    timer: null,

    collapsed: true,

    uiMarker: function() {
      var test = this.get('assignment');
      return this.getPath('assignment.uiMarker');
    }.property('assignment').cacheable(),

    speedupCosts: 2,

    totalBarWidth: function(){
      var progress = 192;
      //return "background-size: "+ progress + "%" + " 100%";
      return "width: "+ progress + "px";
    }.property().cacheable(),

    progressBarWidth: function() {
      var currentInterval = AWE.GS.TimeManager.estimatedServerTime().getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var jobInterval     = Date.parseISODate(this.getPath('assignment.ended_at')).getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var progression = jobInterval != 0 ? currentInterval / jobInterval : -1;
      progression = progression < 0 ? 0 : (progression > 1 ? 1 : progression);
      return 'width: ' + Math.ceil(250 * progression) + 'px;';
    }.property('timeRemaining').cacheable(),

    duration: function() {
      if (this.getPath('isHalved')) {
        return this.getPath('assignmentType.duration') / 2;
      }
      else {
        return this.getPath('assignmentType.duration');
      }
    }.property('isHalved', 'assignment.type_id', 'parentView.assignments.changedAt').cacheable(),

    startPressed: function() {
      var self = this;
      this.set('starting', true);
      this.get('controller').standardAssignmentStartPressed(this.get('assignmentType'), function() {
        self.set('starting', false);
      });
      return false;
    },

    speedupPressed: function() {
      var self = this;
      this.set('halving', true);
      this.get('controller').standardAssignmentSpeedupPressed(this.get('assignment'), function() {
        self.set('halving', false);
      });
      return false;
    },

    togglePressed: function() {
      this.set('collapsed', !this.get('collapsed'));
    },

    collapsePressed: function() {
      this.set('collapsed', true);
    },

    openPressed: function() {
      this.set('collapsed', false);
    },

    finished: function() {
      var t = this.get('timeRemaining');
      return t !== undefined && t !== null && t <= 0;
    }.property('timeRemaining').cacheable(),

    calcTimeRemaining: function() {
      var endedAt = this.getPath('assignment.ended_at');
      if (!endedAt) {
        return ;
      }
      var finish = Date.parseISODate(endedAt);
      var now = AWE.GS.TimeManager.estimatedServerTime(); // now on server
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;
      this.set('timeRemaining', remaining);
    },

    startTimer: function() {
      var timer = this.get('timer');
      if (!timer) {
        timer = setInterval((function(self) {
          return function() {
            self.calcTimeRemaining();
          };
        }(this)), 1000);
        this.set('timer', timer);
      }
    },

    stopTimer: function() {
      var timer = this.get('timer');
      if (timer) {
        clearInterval(timer);
        this.set('timer', null);
      }
    },

    startTimerOnBecommingActive: function() {
      var active = this.get('isActive');
      if (active && this.get('timer')) {
        this.startTimer();
      }
    }.observes('isActive'),


    didInsertElement: function() {
      this.startTimer();
    },

    willDestroyElement: function() {
      this.stopTimer();
    },

    costs: function() {
      var costs = this.getPath('assignmentType.costs') || [];
      var costsResult = [];
      AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {
        var amount = costs[item.id];
        if (amount && amount > 0) {
          costsResult.push(Ember.Object.create({
            amount:       amount,
            resourceType: item,
          }));
        }
      });
      return costsResult;
    }.property('assignmentType').cacheable(),

    unitDeposits: function() {
      var unitdeposits = this.getPath('assignmentType.unit_deposits') || [];
      var depositsResult = [];
      AWE.GS.RulesManager.getRules().unit_types.forEach(function(item) {
        var amount = unitdeposits[item.id];
        if (amount && amount > 0) {
          depositsResult.push(Ember.Object.create({
            amount:   amount,
            unitType: item,
            unitID: item.id,
            symbolic_id: item.db_field,

          }));
        }
      });
      return depositsResult;
    }.property('assignmentType').cacheable(),


    resourceRewards: function() {
      var rewards = this.getPath('assignmentType.rewards.resource_rewards') || [];
      var rewardResult = [];
      if (rewards) {
        rewards.forEach(function(item) {
          var resource = AWE.GS.RulesManager.getRules().getResourceTypeWithSymbolicId(item.resource);
          if (item.amount > 0) {
            rewardResult.push(Ember.Object.create({
              amount:       item.amount,
              resourceType: resource,
            }));
          }
        });
      }
      return rewardResult;
    }.property('assignmentType').cacheable(),

    unitRewards: function() {
      var rewards = this.getPath('assignmentType.rewards.unit_rewards') || [];
      var rewardResult = [];
      if (rewards) {
        rewards.forEach(function(item) {
          var unitType = AWE.GS.RulesManager.getRules().getUnitTypeWithSymbolicId(item.unit);
          if (item.amount > 0) {
            rewardResult.push(Ember.Object.create({
              amount:   item.amount,
              unitType: unitType,
              unitID: unitType.id,
              symbolic_id: unitType.db_field,
            }));
          }
        });
      }
      return rewardResult;
    }.property('assignmentType').cacheable(),

    constructionBonusRewards: function() {
      var rewards = this.getPath('assignmentType.rewards.construction_bonus_rewards') || [];
      var rewardResult = [];
      if (rewards) {
        rewards.forEach(function(item) {
          rewardResult.push({
            bonus: (item.bonus * 100),
            duration: item.duration
          });
        });
      }
      return rewardResult;
    }.property('assignmentType').cacheable(),

    redeemRewards: function() {
      WACKADOO.presentScreenController.standardAssignmentFinishPressed(this.get('assignment'));
    },

    isXPReward: function(){
      var count = this.getPath("assignmentType.rewards.experience_reward");
      if(count && count > 0)
        return true;
      else
        return false;
    }.property().cacheable(),

    isUIMarker: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_FIRST_STANDARD_ASSIGNMENT) ;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),
  });

    
  module.AssignmentsDialog = module.PopUpDialog.extend({
    templateName: 'assignments-dialog',
    classNames: ['assignments-dialog'],

    isInTutorial: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      if(tutorialState.isUIMarkerActive(AWE.GS.MARK_FIRST_STANDARD_ASSIGNMENT)){
        return true;
      }
      return false;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),
  });

  module.AssignmentsTab = Ember.View.extend({
    templateName: 'assignments-tab',
    classNames: ['assignments-tab', "assignments-dialog-pane", "scrolling"],

    init: function() {
      this._super();


      this.set('unlockedAssignments', AWE.GS.game.getPath('currentCharacter.hashableStandardAssignments'));
      this.set('assignments', AWE.GS.RulesManager.getRules().assignment_types);

      this.set('currentCharacter', AWE.GS.game.get('currentCharacter'));
    },

  });

  //special assignments tab
  module.SpecialAssignmentsTab = Ember.View.extend({
    templateName: 'assignments-view-special-tab-new',
    classNames: ['assignments-view-special-tab-new', "assignments-dialog-info"],

    controller: null,

    init: function() {
      this._super();
      this.set('specialAssignment', AWE.GS.game.getPath('currentCharacter.specialAssignment'));
      this.set('currentCharacter', AWE.GS.game.get('currentCharacter'));
      //log('#### sa view', this);
    },

    updateSpecialAssignment: function() {
      var self = this;
      AWE.GS.SpecialAssignmentManager.updateSpecialAssignmentOfCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result, status) {
        if (status === AWE.Net.NOT_FOUND) {
          self.set('specialAssignment', null);
        }
        else {
          self.set('specialAssignment', result);
        }
      });
    }.observes('currentCharacter.specialAssignment', 'specialAssignment.changed_at'),

    getNewSpecialAssignment: function() {
      var self = this;

      var t = this.get('timeRemaining');
      if (t !== undefined && t !== null && t <= 0) {
        AWE.GS.SpecialAssignmentManager.updateSpecialAssignmentOfCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result, status) {
          if (status === AWE.Net.NOT_FOUND) {
            self.set('specialAssignment', null);
          }
          else {
            self.set('specialAssignment', result);
          }
        });
      }
    }.observes('timeRemaining'),

    assignmentType: function() {
      return AWE.GS.RulesManager.getRules().getSpecialAssignmentType(AWE.GS.CharacterManager.getCurrentCharacter().getPath('specialAssignment.type_id'));
    }.property('specialAssignment'),

    starting: false,
    halving: false,

    isActive: function() {
      return this.get('specialAssignment') && this.getPath('specialAssignment.ended_at') != null;
    }.property('specialAssignment.ended_at'),

    isHalved: function() {
      return this.get('specialAssignment') && this.getPath('specialAssignment.halved_at') != null;
    }.property('specialAssignment.halved_at').cacheable(),

    isFinished: function() {
      return this.get('specialAssignment') && this.getPath('specialAssignment.finished');
    }.property('specialAssignment.finished'),

    timer: null,

    collapsed: true,

    speedupCosts: 2,

    progressBarWidth: function() {
      var currentInterval = AWE.GS.TimeManager.estimatedServerTime().getTime() - Date.parseISODate(this.getPath('specialAssignment.started_at')).getTime();
      var jobInterval     = Date.parseISODate(this.getPath('specialAssignment.ended_at')).getTime() - Date.parseISODate(this.getPath('specialAssignment.started_at')).getTime();
      var progression = jobInterval != 0 ? currentInterval / jobInterval : -1;
      progression = progression < 0 ? 0 : (progression > 1 ? 1 : progression);
      return 'width: ' + Math.ceil(250 * progression) + 'px;';
    }.property('timeRemaining').cacheable(),

    duration: function() {
      if (this.getPath('isHalved')) {
        return this.getPath('assignmentType.duration') / 2;
      }
      else {
        return this.getPath('assignmentType.duration');
      }
    }.property('isHalved', 'specialAssignment.type_id', 'parentView.specialAssignments.changedAt').cacheable(),

    startPressed: function() {
      var self = this;
      this.set('starting', true);
      this.get('controller').specialAssignmentStartPressed(this.get('specialAssignment'), function() {
        self.set('starting', false);
      });
      return false;
    },

    speedupPressed: function() {
      var self = this;
      this.set('halving', true);
      this.get('controller').specialAssignmentSpeedupPressed(this.get('specialAssignment'), function() {
        self.set('halving', false);
      });
      return false;
    },

    togglePressed: function() {
      this.set('collapsed', !this.get('collapsed'));
    },

    collapsePressed: function() {
      this.set('collapsed', true);
    },

    openPressed: function() {
      this.set('collapsed', false);
    },

    finished: function() {
      var t = this.get('timeRemaining');
      return t !== undefined && t !== null && t <= 0;
    }.property('timeRemaining').cacheable(),

    calcTimeRemaining: function() {
      var endedAt = this.getPath('specialAssignment.ended_at');
      if (!endedAt) {
        return ;
      }
      var finish = Date.parseISODate(endedAt);
      var now = AWE.GS.TimeManager.estimatedServerTime(); // now on server
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;
      this.set('timeRemaining', remaining);
    },

    startTimer: function() {
      var timer = this.get('timer');
      if (!timer) {
        timer = setInterval((function(self) {
          return function() {
            self.calcTimeRemaining();
          };
        }(this)), 1000);
        this.set('timer', timer);
      }
    },

    stopTimer: function() {
      var timer = this.get('timer');
      if (timer) {
        clearInterval(timer);
        this.set('timer', null);
      }
    },

    startTimerOnBecommingActive: function() {
      var active = this.get('isActive');
      if (active && this.get('timer')) {
        this.startTimer();
      }
    }.observes('isActive'),


    didInsertElement: function() {
      this.startTimer();
    },

    willDestroyElement: function() {
      this.stopTimer();
    },


    costs: function() {
      var costsResult = [];
      var that = this;
      AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {
        var amount = that.getPath('specialAssignment.'+item.symbolic_id+'_cost');
        if (amount && amount > 0) {
          costsResult.push(Ember.Object.create({
            amount:       amount,
            resourceType: item,
          }));
        }
      });
      return costsResult;
    }.property('specialAssignment').cacheable(),


    unitDeposits: function() {
      var depositsResult = [];
      var that = this;
      AWE.GS.RulesManager.getRules().unit_types.forEach(function(item) {
        var amount = that.getPath('specialAssignment.'+item.db_field+'_deposit');
        if (amount && amount > 0) {
          depositsResult.push(Ember.Object.create({
            amount:   amount,
            unitType: item,
          }));
        }
      });
      return depositsResult;
    }.property('specialAssignment').cacheable(),


    resourceRewards: function() {
      var rewards = [];
      var that = this;
      AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {
        var amount = that.getPath('specialAssignment.'+item.symbolic_id+'_reward');
        if (amount && amount > 0) {
          rewards.push(Ember.Object.create({
            amount:   amount,
            resourceType: item,
          }));
        }
      });
      return rewards;
    }.property('specialAssignment').cacheable(),

    unitRewards: function() {
      var rewards = [];
      var that = this;
      AWE.GS.RulesManager.getRules().unit_types.forEach(function(item) {
        var amount = that.getPath('specialAssignment.'+item.db_field+'_reward');
        if (amount && amount > 0) {
          rewards.push(Ember.Object.create({
            amount:   amount,
            unitType: item,
          }));
        }
      });
      return rewards;
    }.property('specialAssignment').cacheable(),

    redeemRewards: function() {
      WACKADOO.presentScreenController.specialAssignmentFinishPressed(this.get('specialAssignment'));
    },
  });

  module.GossipTab = Ember.View.extend({
    templateName: 'assignments-tab-gossip',
  });

  module.AssignmentItemView = Ember.View.extend({
    templateName: 'assignment-item',
    classNames: ['assignment-item'],
    timeRemaining: null,

    currentCharacterBinding: 'AWE.GS.game.currentCharacter',
    isUIMarker: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_FIRST_STANDARD_ASSIGNMENT) ;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

    openDialog: function(){
      if(this.get('isActive'))
        {
          var currentAssignmentType = this.get('assignmentRule');
          var dialog = AWE.UI.Ember.AssignmentsInfoDialog.create({assignmentType: currentAssignmentType, controller: this.get('controller')});
          WACKADOO.presentModalDialog(dialog);
        }
     },

    assignmentRule: function(){
      return AWE.GS.RulesManager.getRules().getAssignmentWithSymbolicId(this.get("assignmentType"));
    }.property("assignmentType"),

    assignment: function() {
      var self = this;
      var foundAssignment = null;
      this.getPath('parentView.unlockedAssignments.collection').forEach(function(assignment) {
        if (self.get('assignmentRule') && assignment.get('type_id') === self.get('assignmentRule').id) {
          foundAssignment = assignment;
        }
      });
      return foundAssignment;
    }.property('assignmentRule', 'parentView.unlockedAssignments.changedAt').cacheable(),

    barWidth: function(){
      return "width: "+ this.get("percent")  +"%";
    }.property("percent"),

    isInProgress: function(){

      progress = this.get("percent") > 0 && this.get("percent") < 100;

      return progress;
    }.property("percent"),

    percent: function() {
      var currentInterval = AWE.GS.TimeManager.estimatedServerTime().getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var jobInterval     = Date.parseISODate(this.getPath('assignment.ended_at')).getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var progression = jobInterval != 0 ? currentInterval / jobInterval : -1;
      progression = progression < 0 ? 0 : (progression > 1 ? 1 : progression);


      return Math.ceil(progression * 100);
    }.property('assignment', 'timeRemaining').cacheable(),

    calcTimeRemaining: function() {
      var endedAt = this.getPath('assignment.ended_at');
      if (!endedAt) {
        return ;
      }

      var finish = Date.parseISODate(endedAt);
      var now = AWE.GS.TimeManager.estimatedServerTime(); // now on server
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;

      if(remaining >=2)
      {
          // not idle
          this.setPath('building.active',true);
      }
      else if(remaining < 2)
      {
          // idle
          this.setPath('building.active',false);
      }

      this.set('timeRemaining', remaining);
    },

    startTimer: function() {

      var timer = this.get('timer');
      if (!timer) {
        timer = setInterval((function(self) {
          return function() {
            self.calcTimeRemaining();
          };
        }(this)), 1000);
        this.set('timer', timer);
      }
    },

    stopTimer: function() {
      var timer = this.get('timer');
      if (timer) {
        clearInterval(timer);
        this.set('timer', null);
      }
    },

    startTimerOnBecommingActive: function() { 
      AWE.GS.CharacterManager.updateCurrentCharacter();
      var active = this.get('isActive');
      if (active && this.get('timer')) {
        this.startTimer();
      }
    }.observes('isActive'),


    didInsertElement: function() {
      this.startTimer();
    },

    willDestroyElement: function() {
      this.get_max_end_time();
      this.stopTimer();
    },


      // save the maximum time till which the assignment is working, if it is working
      // this is used to show the cooking chicken until the assigment is in progress
      // in the settlement
    get_max_end_time:function  () {
      assignments = AWE.GS.game.getPath('currentCharacter.hashableStandardAssignments');

      var max_end_time = null;
      var converted_end_time = new Date();

      for(i=0;i<assignments.collection.length;i++)
        {
          if(assignments.collection[i].ended_at != null)
          {
            assignmentEndTime = new Date(assignments.collection[i].ended_at);

            if(assignmentEndTime.getTime()>converted_end_time.getTime())
            {
              max_end_time = assignments.collection[i].ended_at;
              converted_end_time = assignmentEndTime;
            }
          }
        }
      this.setPath('building.endTime',max_end_time);
    },

    isActive: function() {
      var isActive = false;
      var types = this.get("currentAssignmentTypes");
      if (types) {      
        for (var i = 0; i < types.length; i++) {
          var assignmentType = types[i];
          if (assignmentType['symbolic_id'] === this.get("assignmentType")) {
            isActive = true;
          }
        }
      }
      return isActive;
    }.property("currentAssignmentTypes", "assignmentType"),

    isActiveProgress: function() {
      return this.get('assignment') && this.getPath('assignment.ended_at') != null;
    }.property('assignment.ended_at'),

    isHalved: function() {
      return this.get('assignment') && this.getPath('assignment.halved_at') != null;
    }.property('assignment.halved_at'),

    isFinished: function() {
      return this.get('assignment') && this.getPath('assignment.finished');
    }.property('assignment.finished'),

    currentAssignmentTypes: function() {
      if (this.get('building')) {
        return this.get('building').currentAssignmentTypes();
      }
      else {
        return null;
      }
      /*var level = (AWE.GS.game.getPath('currentCharacter.assignment_level') || 0);
      return AWE.GS.RulesManager.getRules().getAssignmentTypesOfLevel(level);*/
    }.property('building', 'currentCharacter.assignment_level').cacheable(),

    currentSpecialAssignmentTypes: function() {
      if (this.get('building')) {
        return this.get('building').currentSpecialAssignmentTypes();
      }
      else {
        return null;
      }
      /*var level = (AWE.GS.game.getPath('currentCharacter.assignment_level') || 0);
      return AWE.GS.RulesManager.getRules().getSpecialAssignmentTypesOfLevel(level);*/
    }.property('building', 'currentCharacter.assignment_level').cacheable(),

    speedUp: function() {
      var self = this;
      this.get('controller').standardAssignmentSpeedupPressed(this.get('assignment'), function() {
      });
    },

    redeemRewards: function() {
      WACKADOO.presentScreenController.standardAssignmentFinishPressed(this.get('assignment'));
    },

  });

  module.AssignmentTabView = module.TabViewNew.extend({
    
    character: null,   // must be bound to the character
    
    init: function() {
     
      this.set('tabViews', [
        { key:   "tab1",
          title: AWE.I18n.lookupTranslation('dialogs.assignments.quests'), 
          view:  AWE.UI.Ember.AssignmentsTab.extend({
            controllerBinding: "parentView.parentView.controller",
            buildingBinding: "parentView.parentView.building",
            currentCharacterBinding: 'AWE.GS.game.currentCharacter',
          }),
          buttonClass: "left-menu-button",
        }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
        { key:   "tab2",
          title: AWE.I18n.lookupTranslation('dialogs.assignments.special_quests'), 
          view:  AWE.UI.Ember.SpecialAssignmentsTab.extend({ 
            controllerBinding: "parentView.parentView.controller",
          }),
          buttonClass: "middle-menu-button",
        },
        { key:   "tab3",
          title: AWE.I18n.lookupTranslation('dialogs.assignments.gossip'), 
          view:  AWE.UI.Ember.GossipTab,
          buttonClass: "right-menu-button",
        }
      ]);
      
      this._super();
    },
    
    characterObserver: function() {
      var characterId = this.getPath('character.id') || null;
      if (characterId) {
        AWE.GS.CharacterManager.updateCharacter(characterId, AWE.GS.ENTITY_UPDATE_TYPE_FULL);
      }       
    }.observes('character.id'),
  });
  
  return module;
    
}(AWE.UI.Ember || {}));