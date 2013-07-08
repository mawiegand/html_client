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
      var self = this;

      this.set('assignments', AWE.GS.game.getPath('currentCharacter.enumerableStandardAssignments'));
    },

  });

  module.AssignmentView = Ember.View.extend({
    templateName: "assignment-view",

    assignment: null,
    controller: null,

    starting: false,
    halving: false,

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
  });

  return module;

}(AWE.UI.Ember || {});




