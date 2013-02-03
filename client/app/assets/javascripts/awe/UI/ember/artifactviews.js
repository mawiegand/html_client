var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = function(module) {

  module.ArtifactInitiationView = Ember.View.extend({
    templateName: "artifact-initiation-view",

    settlement: null,
    controller: null,
    artifactBinding: 'AWE.GS.game.currentArtifact',

    init: function() {
      AWE.GS.ArtifactManager.updateArtifactOfCharacter(AWE.GS.game.getPath('currentCharacter.id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL);
    },

    startInitiationPressed: function() {
      this.get('controller').startArtifactInitiation(this.get('artifact'), function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {
          log('-----> startInitiationPressed ok or created', status);
        }
        else {
          log('-----> startInitiationPressed error', status);
        }
      });
      return false;     // prevent default behavior
    },

    cancelInitiationPressed: function() {
      // action bauen und wegschicken
    },

  });

  return module;

}(AWE.UI.Ember || {});




