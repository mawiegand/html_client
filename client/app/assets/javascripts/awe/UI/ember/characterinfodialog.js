/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.CharacterInfoDialog = module.Dialog.extend({
    templateName: 'character-info-dialog',
    
    characterId: null,
    character: null,
    alliance: null,
    homeSettlement: null,
    
    setAndUpdateCharacter: function() {
      var characterId = this.get('characterId');
      var self = this;
      if (!characterId) {
        return ;
      }
      var character = AWE.GS.CharacterManager.getCharacter(characterId);
      this.set('character', character);
      AWE.GS.CharacterManager.updateCharacter(characterId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
        self.set('character', result);
      });
    },

    setAndUpdateAlliance: function() {
      var allianceId = this.getPath('character.alliance_id');
      var self = this;
      if (!allianceId) {
        return ;
      }
      var alliance = AWE.GS.AllianceManager.getAlliance(allianceId);
      this.set('alliance', alliance);
      AWE.GS.AllianceManager.updateAlliance(allianceId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
        self.set('alliance', result);
      });
    },  
    
    setAndUpdateHomeSettlement: function() {
      var baseLocationId = this.getPath('character.base_location_id');
      var self = this;
      if (!baseLocationId) {
        return ;
      }
      var settlement = AWE.GS.SettlementManager.getSettlementAtLocation(baseLocationId);
      this.set('homeSettlement', settlement);
      AWE.GS.SettlementManager.updateSettlementsAtLocation(baseLocationId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
        console.log('U: settlement at character.base_location_id', baseLocationId);
        self.set('homeSettlement', AWE.GS.SettlementManager.getSettlementAtLocation(baseLocationId));
      });
    },     
    
    characterIdObserver: function() {
      this.setAndUpdateCharacter();
    }.observes('characterId'),
    
    allianceIdObserver: function() {
      this.setAndUpdateAlliance();
    }.observes('character.alliance_id'),    
    
    baseLocationIdObserver: function() {
      this.setAndUpdateHomeSettlement();
    }.observes('character.base_location_id'),        
    
    init: function() {
      this._super();     
      this.setAndUpdateCharacter();
      this.setAndUpdateAlliance(); 
      this.setAndUpdateHomeSettlement(); 
    },
    
    okClicked: function() {
      this.destroy();
    },
    
    sendMessageClicked: function() {
      var character = this.get('character')
      if (!character) {
        return false;
      }
      WACKADOO.activateMessagesController({ recipient: character });
      WACKADOO.closeAllModalDialogs();
      return false; // prevent default behavior
    },

  });
  
  return module;
    
}(AWE.UI.Ember || {}));



