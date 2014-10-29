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

    init: function() {
      this._super();
      this.set('assignments', AWE.GS.game.getPath('currentCharacter.hashableStandardAssignments'));
      this.set('currentCharacter', AWE.GS.game.get('currentCharacter'));
    },

    open: function(){
      WACKADOO.presentModalDialog(this);
    },
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
  });

    
  module.AssignmentsDialog = module.PopUpDialog.extend({
    templateName: 'assignments-dialog',
    classNames: ['assignments-dialog'],

    /*open: function(){
      WACKADOO.presentModalDialog(this);
    },*/
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
    /*init: function() {
      this._super();
      this.set('specialAssignment', AWE.GS.game.getPath('currentCharacter.specialAssignment'));
      this.set('currentCharacter', AWE.GS.game.get('currentCharacter'));
    },*/

  });

  module.AssignmentItemView = Ember.View.extend({
    templateName: 'assignment-item',
    classNames: ['assignment-item'],
    timeRemaining: null,

    init: function() {
      this._super();
      this.calcTimeRemaining();
    },

    destroy: function() {
      clearTimeout(this._timer);
      this._super();
    },

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
      return this.get("percent") > 0 && this.get("percent") < 100;
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
        clearTimeout(this._timer);
        return ;
      }
      var finish = Date.parseISODate(endedAt);
      var now = AWE.GS.TimeManager.estimatedServerTime(); // now on server
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;
      this.set('timeRemaining', remaining);
      self = this;
      this._timer = setTimeout(function(){ self.calcTimeRemaining(); }, 1000)
    }.observes('assignment.ended_at'),

    isActive: function(){
      var types = this.get("currentAssignmentTypes");
      var isActive = false;
      for (var i = 0; i < types.length; i++) {
        var assignmentType = types[i];
        if (assignmentType['symbolic_id'] === this.get("assignmentType")) {
          isActive = true;
        }
      }

      return isActive;
    }.property("currentAssignmentTypes", "assignmentType"),

    currentAssignmentTypes: function() {
      var level = (AWE.GS.game.getPath('currentCharacter.assignment_level') || 0);
      return AWE.GS.RulesManager.getRules().getAssignmentTypesOfLevel(level);
    }.property(),

    currentSpecialAssignmentTypes: function() {
      var level = (AWE.GS.game.getPath('currentCharacter.assignment_level') || 0);
      return AWE.GS.RulesManager.getRules().getSpecialAssignmentTypesOfLevel(level);
    }.property(),

  });

  module.AssignmentTabView = module.TabViewNew.extend({
    
    character: null,   // must be bound to the character
    
    init: function() {
     
      this.set('tabViews', [
        { key:   "tab1",
          title: AWE.I18n.lookupTranslation('dialogs.assignments.quests'), 
          view:  AWE.UI.Ember.AssignmentsTab,
          buttonClass: "left-menu-button",
          controllerBinding: "parentView.controller",
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
          view:  AWE.UI.Ember.AssignmentsTab,
          buttonClass: "right-menu-button",
          controllerBinding: "parentView.controller",
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