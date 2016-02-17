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

  return module;

}(AWE.UI.Ember || {});




