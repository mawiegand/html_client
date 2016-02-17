var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = function(module) {

  module.AssignmentListView = Ember.View.extend({
    templateName: "assignment-list-view",

    building: null,
    controller: null,
    currentCharacter: null,

    //test open dialog
    openDialog: function(){
//        var dialog = AWE.UI.Ember.AssignmentsDialog.create({controller: this.get('controller')});
//        WACKADOO.presentModalDialog(dialog);
     },

    assignmentTypes: function() {
      if (this.get('building')) {
        return this.get('building').currentAssignmentTypes();
      }
      else {
        return null;
      }
    }.property('building', 'currentCharacter.assignment_level').cacheable(),

    specialAssignmentTypes: function() {
      if (this.get('building')) {
        return this.get('building').currentSpecialAssignmentTypes();
      }
      else {
        return null;
      }
    }.property('building', 'currentCharacter.assignment_level').cacheable(),

    assignments: null,
    specialAssignmentBinding: 'currentCharacter.specialAssignment',

    init: function() {
      this._super();
      this.set('assignments', AWE.GS.game.getPath('currentCharacter.hashableStandardAssignments'));
//      this.set('specialAssignment', AWE.GS.game.getPath('currentCharacter.specialAssignment'));
      this.set('currentCharacter', AWE.GS.game.get('currentCharacter'));
    },

  });

  /**
   * in assignment nicht collection holen, sondern
   */
  module.SpecialAssignmentView = Ember.View.extend({
    templateName: "special-assignment-view",

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
    }
  });

  return module;

}(AWE.UI.Ember || {});




