/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.BattleParticipantView = module.Dialog.extend({
    templateName: 'battle-participant-view',

    participant: null,
    
    init: function() {
      this._super();      
    },
    
    characterLinkPressed: function() {
      alert('Present Modal dialog for Character ' + army.owner_name + '.');
      return false;
    },

    armyLinkPressed: function() {
      var army = this.get('army'); 
      if (!army) {
        return ;
      }
      var dialog = AWE.UI.Ember.ArmyInfoNewDialog.create({
        army: army,
      });
      WACKADOO.presentModalDialog(dialog);     
      return false; // prevent default behaviour
    },
  });
  
  module.AttackDialog = module.Dialog.extend({
    templateName: 'attack-dialog',
        
    army: null,
    targetArmy: null,
    
    friendlyArmies: null,
    enemyArmies: null,
    
    friendlyPlayerNames: function() {
      var friendlyArmies = this.get('friendlyArmies');
      var playerNames = [];
      friendlyArmies.forEach(function(army) {
        playerNames.pushObject(army.get('ownerString'));
      });
      return playerNames.uniq();
    }.property('friendlyArmies.@each').cacheable(),
    
    enemyPlayerNames: function() {
      var enemyArmies = this.get('enemyArmies');
      var playerNames = [];
      enemyArmies.forEach(function(army) {
        playerNames.pushObject(army.get('ownerString'));
      });
      return playerNames.uniq();
    }.property('enemyArmies.@each').cacheable(),
    
    init: function() {
      this._super();
      this.addParticipants();      
    },
    
    attackerBattleLoading: false,
    defenderBattleLoading: false,
    
    loading: function() {
      return this.get('attackerBattleLoading') || this.get('defenderBattleLoading');
    }.property('attackerBattleLoading', 'defenderBattleLoading').cacheable(),
    
    factionContainsArmyOf: function(factionArmies, characterId) {
      for (var i = 0; i < factionArmies.length; i++) {
        var factionArmy = factionArmies[i];
        if (factionArmy != null && factionArmy.get('owner_id') === characterId) {
          return true;
        }
      }
      return false;
    },

    addSettlementDefenders: function() {
      var self = this;
      var attackerArmy = self.get('army');
      var defenderArmy = self.get('targetArmy');
      var enemyArmies = self.get('enemyArmies');
      var friendlyArmies = self.get('friendlyArmies');
      
      if (!attackerArmy.get('location').isEmpty()) {
        if (attackerArmy.get('garrison')) {
          var otherArmies = AWE.GS.ArmyManager.getArmiesAtLocation(attackerArmy.get('location_id'));
          AWE.Ext.applyFunctionToHash(otherArmies, function(otherArmyId, otherArmy){
            if (attackerArmy != otherArmy &&
                defenderArmy != otherArmy &&
                !otherArmy.get('isFighting') &&
                (otherArmy.sameAllianceAs(attackerArmy) || otherArmy.sameOwnerAs(attackerArmy)) &&
                !self.factionContainsArmyOf(enemyArmies, otherArmy.get('owner_id')) &&
                otherArmy.get('isDefendingFortress')) {
              friendlyArmies.pushObject(otherArmy);
            }
          });
        }
        else if (defenderArmy.get('garrison') || defenderArmy.factionContainsGarrison()) {
          var otherArmies = AWE.GS.ArmyManager.getArmiesAtLocation(attackerArmy.get('location_id'));
          AWE.Ext.applyFunctionToHash(otherArmies, function(otherArmyId, otherArmy){
            if (attackerArmy != otherArmy &&
                defenderArmy != otherArmy &&
                !otherArmy.get('isFighting') &&
                (otherArmy.sameAllianceAs(defenderArmy) || otherArmy.sameOwnerAs(defenderArmy)) &&
                !self.factionContainsArmyOf(friendlyArmies, otherArmy.get('owner_id')) &&
                (otherArmy.get('isDefendingFortress') || otherArmy.get('garrison'))) {
              enemyArmies.pushObject(otherArmy);
            }
          });
        }
        else if (defenderArmy.get('isDefendingFortress') &&
            !defenderArmy.get('isFighting') &&
            defenderArmy.sameAllianceAs(attackerArmy.get('location').garrisonArmy())) {
          var otherArmies = AWE.GS.ArmyManager.getArmiesAtLocation(attackerArmy.get('location_id'));
          AWE.Ext.applyFunctionToHash(otherArmies, function(otherArmyId, otherArmy){
            if (attackerArmy != otherArmy &&
                defenderArmy != otherArmy &&
                !otherArmy.get('isFighting') &&
                (otherArmy.sameAllianceAs(defenderArmy) || otherArmy.sameOwnerAs(defenderArmy)) &&
                !self.factionContainsArmyOf(friendlyArmies, otherArmy.get('owner_id')) &&
                (otherArmy.get('isDefendingFortress') || otherArmy.get('garrison'))) {
              enemyArmies.pushObject(otherArmy);
            }
            else if (attackerArmy != otherArmy &&
                defenderArmy != otherArmy &&
                otherArmy.get('isFighting') &&
                otherArmy.get('garrison')) {
              self.set('attackerBattleLoading', true);
              enemyArmies.pushObject(otherArmy);
              AWE.GS.BattleManager.updateBattle(otherArmy.get('battle_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(battle) {
                self.set('attackerBattleLoading', false);
                var participants = battle.participantsOfFactionWithArmy(otherArmy);
                AWE.Ext.applyFunction(participants, function(participant){
                  var a = participant.get('army');
                  if (a) {
                    enemyArmies.pushObject(a);
                  }
                });
                participants = battle.participantsOfFactionAgainstArmy(otherArmy);
                AWE.Ext.applyFunction(participants, function(participant){
                  var a = participant.get('army');
                  if (a) {
                    friendlyArmies.pushObject(a);
                  }
                });
              });     
            }
          });
        }
      }
    },
    
    addParticipants: function() {
      var self = this;
      var enemyArmies = self.getPath('enemyArmies');
      var friendlyArmies = self.get('friendlyArmies');
      
      friendlyArmies.pushObject(this.get('army'));
      enemyArmies.pushObject(this.get('targetArmy'));
        
      if (this.getPath('army.isFighting') && this.getPath('targetArmy.isFighting')) {

        this.set('attackerBattleLoading', true);
        this.set('defenderBattleLoading', true);

        AWE.GS.BattleManager.updateBattle(this.getPath('army.battle_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(battle) {          

          self.set('attackerBattleLoading', false);
          
          var participants = battle.participantsOfFactionWithArmy(self.get('army'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              friendlyArmies.pushObject(army);
            }
          });
          
          participants = battle.participantsOfFactionAgainstArmy(self.get('army'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              enemyArmies.pushObject(army);
            }
          });
        
          // the two battles must be loaded successively to add non fighting defenders after both battles have been fully loaded.          
          AWE.GS.BattleManager.updateBattle(self.getPath('targetArmy.battle_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(battle) {
                      
            self.set('defenderBattleLoading', false);
            
            var participants = battle.participantsOfFactionWithArmy(self.get('targetArmy'));
            AWE.Ext.applyFunction(participants, function(participant){
              var army = participant.get('army');
              if (army) {
                enemyArmies.pushObject(army);
              }
            });
            
            participants = battle.participantsOfFactionAgainstArmy(self.get('targetArmy'));
            AWE.Ext.applyFunction(participants, function(participant){
              var army = participant.get('army');
              if (army) {
                friendlyArmies.pushObject(army);
              }
            });
            
            self.addSettlementDefenders();
          });
        });
      }
      else if (this.getPath('army.isFighting')) {
        
        this.set('attackerBattleLoading', true);
        
        AWE.GS.BattleManager.updateBattle(this.getPath('army.battle_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(battle) {
                    
          self.set('attackerBattleLoading', false);
          
          var participants = battle.participantsOfFactionWithArmy(self.get('army'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              friendlyArmies.pushObject(army);
            }
          });
          
          participants = battle.participantsOfFactionAgainstArmy(self.get('army'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              enemyArmies.pushObject(army);
            }
          });
          
          self.addSettlementDefenders();
        });     
      }
      else if (this.getPath('targetArmy.isFighting')) {
        
        this.set('defenderBattleLoading', true);
        
        AWE.GS.BattleManager.updateBattle(this.getPath('targetArmy.battle_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(battle) {
                    
          self.set('defenderBattleLoading', false);
          
          var participants = battle.participantsOfFactionWithArmy(self.get('targetArmy'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              enemyArmies.pushObject(army);
            }
          });
          
          participants = battle.participantsOfFactionAgainstArmy(self.get('targetArmy'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              friendlyArmies.pushObject(army);
            }
          });
          
          self.addSettlementDefenders();
        });      
      }
      else if (this.getPath('targetArmy.isFighting')) {
        
        this.set('defenderBattleLoading', true);
        
        AWE.GS.BattleManager.updateBattle(this.getPath('targetArmy.battle_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(battle) {
                    
          self.set('defenderBattleLoading', false);
          
          var participants = battle.participantsOfFactionWithArmy(self.get('targetArmy'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              enemyArmies.pushObject(army);
            }
          });
          
          participants = battle.participantsOfFactionAgainstArmy(self.get('targetArmy'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              friendlyArmies.pushObject(army);
            }
          });
          
          self.addSettlementDefenders();
        });      
      }
      else { // add only defender if not fighting
        self.addSettlementDefenders();
      }
    },
  });
  
  module.AttackParticipantView = Ember.View.extend({
    templateName: 'attack-participant-view',

    name: null,
    
    classNameBindings: ['ownCharacter'],
    
    ownCharacter: function() {
      var owner = AWE.GS.game.get('currentCharacter');
      if (owner.get('alliance_tag') && owner.get('alliance_tag') != '') {
        return this.get('name') == owner.get('name') + ' | ' + owner.get('alliance_tag');
      }
      else {
        return this.get('name') == owner.get('name');
      }      
    }.property('AWE.GS.game.currentCharacter').cacheable(),
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));



