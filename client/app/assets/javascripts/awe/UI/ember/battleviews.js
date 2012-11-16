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
    
    friendlyPlayers: null,
    enemyPlayers: null,
    
    friendlyPlayerNames: function() {
      var friendlyPlayers = this.get('friendlyPlayers');
      var playerNames = [];
      this.get('friendlyPlayers').forEach(function(army) {
        playerNames.pushObject(army.get('ownerString'));
      });
      log('---> playerNames', playerNames.uniq());
      return playerNames.uniq();
    }.property('friendlyPlayers.@each').cacheable(),
    
    enemyPlayerNames: function() {
      var friendlyPlayers = this.get('enemyPlayers');
      var playerNames = [];
      this.get('enemyPlayers').forEach(function(army) {
        playerNames.pushObject(army.get('ownerString'));
      });
      log('---> playerNames', playerNames.uniq());
      return playerNames.uniq();
    }.property('enemyPlayers.@each').cacheable(),
    
    init: function() {
      this._super();
      this.addParticipants();      
    },
    
    attackerBattleLoading: false,
    defenderBattleLoading: false,
    
    loading: function() {
      return this.get('attackerBattleLoading') || this.get('defenderBattleLoading');
    }.property('attackerBattleLoading', 'defenderBattleLoading').cacheable(),
    
    addParticipants: function() {
      var self = this;
      var enemyPlayers = self.getPath('enemyPlayers');
      var friendlyPlayers = self.get('friendlyPlayers');

      // add armies of attacker's faction if fighting      
      if (this.getPath('army.isFighting')) {
        this.set('attackerBattleLoading', true);
        AWE.GS.BattleManager.updateBattle(this.getPath('army.battle_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(battle) {          
          // remove spinwheel
          self.set('attackerBattleLoading', false);
          var participants = battle.participantsOfFactionWithArmy(self.get('army'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              friendlyPlayers.pushObject(army);
            }
          });
          
          var participants = battle.participantsOfFactionAgainstArmy(self.get('army'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              enemyPlayers.pushObject(army);
            }
          });
        });      
      }
      else { // add only attacker if not fighting
        friendlyPlayers.pushObject(this.get('army'));
      }
      
      // add armies of defender's faction if fighting
      if (this.getPath('targetArmy.isFighting')) {
        this.set('defenderBattleLoading', true);
        AWE.GS.BattleManager.updateBattle(this.getPath('targetArmy.battle_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(battle) {          
          self.set('defenderBattleLoading', false);
          var participants = battle.participantsOfFactionWithArmy(self.get('targetArmy'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              enemyPlayers.pushObject(army);
            }
          });
          
          var participants = battle.participantsOfFactionAgainstArmy(self.get('targetArmy'));
          AWE.Ext.applyFunction(participants, function(participant){
            var army = participant.get('army');
            if (army) {
              friendlyPlayers.pushObject(army);
            }
          });
        });      
      }
      else { // add only defender if not fighting
        enemyPlayers.pushObject(this.get('targetArmy'));
      }

      // look for defending armies at fortresses when attacker is fortress garrison army. same conditions as in rails models are implemented
      if (this.getPath('army.garrison') && this.getPath('army.location').isFortress()) {
        var otherArmies = AWE.GS.ArmyManager.getArmiesAtLocation(this.getPath('army.location').id());
        AWE.Ext.applyFunctionToHash(otherArmies, function(otherArmyId, otherArmy){
          if (self.get('army') != otherArmy &&
              self.get('targetArmy') != otherArmy &&
              !otherArmy.get('isFighting') &&
              otherArmy.get('owner_id') != self.getPath('targetArmy.owner_id') &&
              otherArmy.get('isDefendingFortress')) {
            friendlyPlayers.pushObject(otherArmy);
          }
        });
      }

      // look for defending armies at fortresses when defender is fortress garrison army. same conditions as in rails models are implemented
      if (this.getPath('targetArmy.garrison') && this.getPath('targetArmy.location').isFortress()) {
        var otherArmies = AWE.GS.ArmyManager.getArmiesAtLocation(this.getPath('targetArmy.location').id());
        AWE.Ext.applyFunctionToHash(otherArmies, function(otherArmyId, otherArmy){
          if (self.get('army') != otherArmy &&
              self.get('targetArmy') != otherArmy &&
              !otherArmy.get('isFighting') &&
              otherArmy.get('owner_id') != self.getPath('army.owner_id') &&
              otherArmy.get('isDefendingFortress')) {
            enemyPlayers.pushObject(otherArmy);
          }
        });
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




