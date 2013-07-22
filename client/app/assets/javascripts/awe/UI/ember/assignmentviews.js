var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = function(module) {

  module.AssignmentListView = Ember.View.extend({
    templateName: "assignment-list-view",

    building: null,
    controller: null,
    currentCharacter: null,

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
    specialAssignment: null,

    // property namens "specialassignments()" --> 

    init: function() {
      this._super();
      this.set('assignments', AWE.GS.game.getPath('currentCharacter.hashableStandardAssignments'));
      this.set('specialAssignment', AWE.GS.game.getPath('currentCharacter.specialAssignment'));
      this.set('currentCharacter', AWE.GS.game.get('currentCharacter'));
    },

  });

  module.AssignmentView = Ember.View.extend({
    templateName: "assignment-view",

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

    timer: null,

    collapsed: true,

    speedupCosts: 2,

    progressBarWidth: function() {
      var currentInterval = AWE.GS.TimeManager.estimatedServerTime().getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var jobInterval     = Date.parseISODate(this.getPath('assignment.ended_at')).getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var progression = jobInterval != 0 ? currentInterval / jobInterval : -1;
      progression = progression < 0 ? 0 : (progression > 1 ? 1 : progression);
      return 'width: ' + Math.ceil(300 * progression) + 'px;';
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
            }));
          }
        });
      }
      return rewardResult;
    }.property('assignmentType').cacheable(),
  });

  /**
   * in assignment nicht collection holen, sondern
   */
  module.SpecialAssignmentView = Ember.View.extend({
    templateName: "special-assignment-view",

    controller: null,

    init: function() {
      this._super();
      log('#### sa view', this);
    },

    assignmentType: function() {
      return AWE.GS.RulesManager.getRules().getSpecialAssignmentType(AWE.GS.CharacterManager.getCurrentCharacter().getPath('specialAssignment.type_id'));
    }.property('specialAssignment'),

    starting: false,
    halving: false,

    isActive: function() {
      return this.get('specialAssignment') && this.getPath('specialAssignment.ended_at') != null;
    }.property('assignment.ended_at').cacheable(),

    isHalved: function() {
      return this.get('specialAssignment') && this.getPath('specialAssignment.halved_at') != null;
    }.property('specialAssignment.halved_at').cacheable(),

    timer: null,

    collapsed: true,

    speedupCosts: 2,

    progressBarWidth: function() {
      var currentInterval = AWE.GS.TimeManager.estimatedServerTime().getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var jobInterval     = Date.parseISODate(this.getPath('assignment.ended_at')).getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var progression = jobInterval != 0 ? currentInterval / jobInterval : -1;
      progression = progression < 0 ? 0 : (progression > 1 ? 1 : progression);
      return 'width: ' + Math.ceil(300 * progression) + 'px;';
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
      var costsResult = [];
      var that = this;

      //specialAssignment.resource_XXX_amount
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
      var unitdeposits = this.getPath('assignmentType.unit_deposits') || [];
      var depositsResult = [];
      var that = this;
      AWE.GS.RulesManager.getRules().unit_types.forEach(function(item) {
        log('#### unit', item);
        var amount = that.getPath('specialAssignment.'+item.db_field+'_deposit');
        log('### unit amount', amount);
        if (amount && amount > 0) {
          depositsResult.push(Ember.Object.create({
            amount:   amount,
            unitType: item,
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
            }));
          }
        });
      }
      return rewardResult;
    }.property('assignmentType').cacheable(),
  });

  return module;

}(AWE.UI.Ember || {});




