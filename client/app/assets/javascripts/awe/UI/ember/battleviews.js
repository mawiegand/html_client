/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.BattleDialog = module.Dialog.extend({
    templateName: 'battle-dialog',
    
    init: function() {
      this._super();      
    },

    battle: null,
    participantsOwnFaction:   'battle.participantsOwnFaction',
    participantsOtherFaction: 'battle.participantsOtherFaction',
    
    ratioLengthOwn: function(){
      return 'width: ' + Math.round(780 * this.getPath('battle.ratio')) + 'px;';
    }.property('battle.ratio').cacheable(),

    ratioLengthOther: function(){
      return 'width: ' + Math.round(780 * (1 - this.getPath('battle.ratio'))) + 'px;';
    }.property('battle.ratio').cacheable(),

    message: function() {
      var own = this.getPath('battle.ownBattle');
      if (own === undefined || own === null) {
        return null; // return nothing, if value hasn't been computed so far.
      }
      if (own) {
        if (this.getPath('battle.ratio') > 0.7) {
          return AWE.I18n.lookupTranslation('battle.messages.own.winning');
        }
        else if (this.getPath('battle.ratio') < 0.3) {
          return AWE.I18n.lookupTranslation('battle.messages.own.losing');
        }
        else {
          return AWE.I18n.lookupTranslation('battle.messages.own.neutral');
        }
      }
      else {
        return AWE.I18n.lookupTranslation('battle.messages.other');
      }
    }.property('battle').cacheable(),
  });
  
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
      var dialog = AWE.UI.Ember.ArmyInfoDialog.create({
        army: army,
      });
      dialog.showModal();      
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
      this.get('friendlyArmies').forEach(function(army) {
        playerNames.pushObject(army.get('ownerString'));
      });
      return playerNames.uniq();
    }.property('friendlyArmies.@each').cacheable(),
    
    enemyPlayerNames: function() {
      var friendlyArmies = this.get('enemyArmies');
      var playerNames = [];
      this.get('enemyArmies').forEach(function(army) {
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

    addFortressDefenders: function() {
      var self = this;
      var army = self.get('army');
      var targetArmy = self.get('targetArmy');
      var enemyArmies = self.getPath('enemyArmies');
      var friendlyArmies = self.get('friendlyArmies');
      
      if (army.get('location').isFortress()) {
        if (army.get('garrison')) {
          var otherArmies = AWE.GS.ArmyManager.getArmiesAtLocation(army.get('location_id'));
          AWE.Ext.applyFunctionToHash(otherArmies, function(otherArmyId, otherArmy){
            if (army != otherArmy &&
                targetArmy != otherArmy &&
                !otherArmy.get('isFighting') &&
                !self.factionContainsArmyOf(enemyArmies, otherArmy.get('owner_id')) &&
                otherArmy.get('isDefendingFortress')) {
              friendlyArmies.pushObject(otherArmy);
            }
          });
        }
        
        if (targetArmy.get('garrison') ||
            targetArmy.get('isDefendingFortress') ||
            targetArmy.factionContainsGarrison()) {
          var otherArmies = AWE.GS.ArmyManager.getArmiesAtLocation(army.get('location_id'));
          AWE.Ext.applyFunctionToHash(otherArmies, function(otherArmyId, otherArmy){
            if (army != otherArmy &&
                targetArmy != otherArmy &&
                !otherArmy.get('isFighting') &&
                !self.factionContainsArmyOf(friendlyArmies, otherArmy.get('owner_id')) &&
                (otherArmy.get('isDefendingFortress') || otherArmy.get('garrison'))) {
              enemyArmies.pushObject(otherArmy);
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
          
          var participants = battle.participantsOfFactionAgainstArmy(self.get('army'));
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
            
            var participants = battle.participantsOfFactionAgainstArmy(self.get('targetArmy'));
            AWE.Ext.applyFunction(participants, function(participant){
              var army = participant.get('army');
              if (army) {
                friendlyArmies.pushObject(army);
              }
            });
            
            self.addFortressDefenders();
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
          
          var participants = battle.participantsOfFactionAgainstArmy(self.get('army'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              enemyArmies.pushObject(army);
            }
          });
          
          self.addFortressDefenders();
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
          
          var participants = battle.participantsOfFactionAgainstArmy(self.get('targetArmy'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              friendlyArmies.pushObject(army);
            }
          });
          
          self.addFortressDefenders();
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
          
          var participants = battle.participantsOfFactionAgainstArmy(self.get('targetArmy'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              friendlyArmies.pushObject(army);
            }
          });
          
          self.addFortressDefenders();
        });      
      }
      else { // add only defender if not fighting
        self.addFortressDefenders();
      }
    },
  });
  
  module.AttackParticipantView = Ember.View.extend({
    templateName: 'attack-participant-view',

    name: null,
    
    classNameBindings: ['ownCharacter'],
    
    ownCharacter: function() {
      var owner = AWE.GS.player.get('currentCharacter');
      if (owner.get('alliance_tag') && owner.get('alliance_tag') != '') {
        return this.get('name') == owner.get('name') + ' | ' + owner.get('alliance_tag');
      }
      else {
        return this.get('name') == owner.get('name');
      }      
    }.property('AWE.GS.player').cacheable(),
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




