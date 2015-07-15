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

  module.AssignmentNewInfoView = module.AssignmentView.extend({
    templateName: 'assignments-dialog-view-new',

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
    classNames: ['assignments-tab', "assignments-dialog-pane"],

    init: function() {
      this._super();


      this.set('assignments', AWE.GS.game.getPath('currentCharacter.hashableStandardAssignments'));

//      this.set('specialAssignment', AWE.GS.game.getPath('currentCharacter.specialAssignment'));
      this.set('currentCharacter', AWE.GS.game.get('currentCharacter'));
    },

  });

  //special assignments tab
  module.SpecialAssignmentsTab = module.SpecialAssignmentView.extend({
    templateName: 'assignments-view-special-tab-new',
    classNames: ['assignments-view-special-tab-new', "assignments-dialog-info"],
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
      this.getPath('parentView.assignments.collection').forEach(function(assignment) {
        if (self.get('assignmentRule') && assignment.get('type_id') == self.get('assignmentRule').id) {
          foundAssignment = assignment;
        }
      });
      return foundAssignment;
    }.property('assignmentRule', 'parentView.assignments.changedAt').cacheable(),

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

      var max_end_time = new Date();
      for(i=0;i<assignments.collection.length;i++)
      {
        if(assignments.collection[i].ended_at != null)
        {

          endtime = new Date(assignments.collection[i].ended_at);

          if(endtime.getTime()> max_end_time)
          {
             max_end_time = assignments.collection[i].ended_at;
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