var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = function(module) {

  module.ArtifactInitiationView = Ember.View.extend({
    templateName: "artifact-initiation-view",

    settlement: null,
    controller: null,
    artifact: 'AWE.GS.game.currentArtifact',

    init: function() {
      var self = this;
      // update des eigenen artefakts;
      log('-----> start init', AWE.GS.game.get('currentArtifact'));
      AWE.GS.ArtifactManager.updateArtifactOfCharacter(AWE.GS.game.getPath('currentCharacter.id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(artifact) {
        log('-----> artifact', artifact);
//        self.set('artifact', artifact);
        log('-----> stop init', AWE.GS.game.get('currentArtifact'));
      });
    },

    startInitiationPressed: function() {
      // action bauen und wegschicken
    },

    cancelInitiationPressed: function() {
      // action bauen und wegschicken
    },

  });

  return module;

}(AWE.UI.Ember || {});




