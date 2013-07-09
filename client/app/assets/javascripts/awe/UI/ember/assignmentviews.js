var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = function(module) {

  module.AssignmentListView = Ember.View.extend({
    templateName: "assignment-list-view",

    building: null,
    controller: null,

    assignments: null,

    init: function() {
      this._super();
      this.set('assignments', AWE.GS.game.getPath('currentCharacter.enumerableStandardAssignments'));
    },

  });

  module.AssignmentView = Ember.View.extend({
    templateName: "assignment-view",

    assignment: null,
    controller: null,

    starting: false,
    halving: false,

    timer: null,

    speedupCosts: 2,

    progressBarWidth: function() {
      var currentInterval = AWE.GS.TimeManager.estimatedServerTime().getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var jobInterval     = Date.parseISODate(this.getPath('assignment.ended_at')).getTime() - Date.parseISODate(this.getPath('assignment.started_at')).getTime();
      var progression = jobInterval != 0 ? currentInterval / jobInterval : -1;
      progression = progression < 0 ? 0 : (progression > 1 ? 1 : progression);
      return 'width: ' + Math.ceil(300 * progression) + 'px;';
    }.property('timeRemaining'),

    duration: function() {
      if (this.getPath('assignment.isHalved')) {
        return this.getPath('assignment.assignmentType.duration') / 2;
      }
      else {
        return this.getPath('assignment.assignmentType.duration');
      }
    }.property('assignment.isHalved', 'assignment.type_id').cacheable(),

    startPressed: function() {
      var self = this;
      this.set('starting', true);
      this.get('controller').standardAssignmentStartPressed(this.get('assignment'), function() {
        self.set('starting', false);
      });
    },

    speedupPressed: function() {
      var self = this;
      this.set('halving', true);
      this.get('controller').standardAssignmentSpeedupPressed(this.get('assignment'), function() {
        self.set('halving', false);
      });
    },

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
      var active = this.getPath('assignment.isActive');
      if (active && this.get('timer')) {
        this.startTimer();
      }
    }.observes('assignment.isActive'),


    didInsertElement: function() {
      this.startTimer();
    },

    willDestroyElement: function() {
      this.stopTimer();
    },
  });

  return module;

}(AWE.UI.Ember || {});




