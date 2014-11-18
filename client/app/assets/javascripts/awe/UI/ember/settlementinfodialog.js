/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.SettlementInfoDialog = module.PopUpDialog.extend({
    templateName: 'settlement-info-dialog',

    locationId: null,

    settlement: null,
    owner: null,
    alliance: null,

    setAndUpdateSettlement: function() {
      var locationId = this.get('locationId');
      var self = this;
      if (!locationId) {
        return ;
      }
      var settlement = AWE.GS.SettlementManager.getSettlementAtLocation(locationId);
      this.set('settlement', settlement);
      AWE.GS.SettlementManager.updateSettlementsAtLocation(locationId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
        log('U: settlement at location_id', locationId);
        self.set('settlement', AWE.GS.SettlementManager.getSettlementAtLocation(locationId));
      });
    },

    setAndUpdateOwner: function() {
      var characterId = this.getPath('settlement.owner_id');
      var self = this;
      if (!characterId) {
        return ;
      }
      var character = AWE.GS.CharacterManager.getCharacter(characterId);
      this.set('owner', character);
      AWE.GS.CharacterManager.updateCharacter(characterId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(result) {
        self.set('owner', result);
      });
    },

    setAndUpdateAlliance: function() {
      var allianceId = this.getPath('settlement.alliance_id');
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

    ownerIdObserver: function() {
      this.setAndUpdateOwner();
    }.observes('settlement.owner_id'),
    
    allianceIdObserver: function() {
      this.setAndUpdateAlliance();
    }.observes('settlement.alliance_id'),       
    
    locationIdObserver: function() {
      this.setAndUpdateSettlement();
    }.observes('locationId'),

    characterPressed: function() {
      var characterId = this.getPath('settlement.owner_id');
      if (characterId != null) {
        var dialog = AWE.UI.Ember.CharacterInfoDialog.create({
          characterId: characterId,
        });
        WACKADOO.presentModalDialog(dialog);
      }
      return false; // prevent default behavior
    },

    alliancePressed: function() {
      var allianceId = this.getPath('settlement.alliance_id');
      if (allianceId != null) {
        WACKADOO.showAllianceDialog(allianceId);
      }
      return false; // prevent default behavior
    },
    
    init: function() {
      this._super();      
      this.setAndUpdateSettlement();
      this.setAndUpdateOwner();
      this.setAndUpdateAlliance();
    },
    
    okClicked: function() {
      this.destroy();
    },

  });
  
  return module;
    
}(AWE.UI.Ember || {}));