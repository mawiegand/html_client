/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.BattleDialog = module.PopUpDialog.extend({
    templateName: 'battle-dialog',
    
    battle:                    null,
    timer:                     null,
    
    participantsOwnFaction:   'battle.participantsOwnFaction',
    participantsOtherFaction: 'battle.participantsOtherFaction',

    ownFactionBinding:        'battle.ownFaction',
    otherFactionBinding:      'battle.otherFaction',
        
 
    init: function() {
      this._super(); 
    },
    
    region_name: function() {
      var region_id = this.getPath('battle.region_id');
      if(region_id){
        var region = AWE.Map.Manager.getRegion(region_id);
        return (typeof region !== "undefined") ? region.name() : null;
      }
      return null;  
    }.property('battle'),
    
    initiator_name: function() {
      var initiator_id = this.getPath('battle.initiator_id');
      if(initiator_id){
        var initiator = AWE.GS.CharacterManager.getCharacter(initiator_id);
        return (typeof initiator !== "undefined") ? initiator.name : null;
      }
      return null;
    }.property('battle'),


    opponent_name: function() {
      var opponent_id = this.getPath('battle.opponent_id');
      if(opponent_id)
      {
        var opponent = AWE.GS.CharacterManager.getCharacter(opponent_id);
        if(typeof opponent === "undefined"){
          var participants = this.getPath('battle.participants.content');
          for(var i=0; i<participants.length; i++)
            if(participants[i].character_id == opponent_id)
              return participants[i].army_name;
        }else{
          return opponent;
        }
      }
      return null;
    }.property('battle'),
    
    round: function() {
      var nextRound = this.getPath('battle.nextRoundNumber');
      return nextRound - 1;
    }.property('battle'),

    attack_started_at_date: function() {
      var date = new Date(this.getPath('battle.started_at'));
      return (typeof date !== "undefined") ? date.toLocaleDateString() : null;
    }.property('battle'),
    
    attack_started_at_time: function() {
      var date = new Date(this.getPath('battle.started_at'));
      return (typeof date !== "undefined") ? date.toLocaleTimeString() : null;
    }.property('battle'),
    
    
    army_of_initiator: function(){
      var initiator_id = this.getPath('battle.initiator_id');
      var opponent_id = this.getPath('battle.opponent_id');
      var participants = this.getPath('battle.participants.content');
      for(var i=0; i<participants.length; i++)
        if(participants[i].character_id == initiator_id)
          return participants[i].get('army');
      return null;
    }.property('battle'),

    own_army_battle_count: function(){
      return this.getPath('battle.participantsOwnFaction').length;
    }.property('battle'),

    other_army_battle_count: function(){
      return this.getPath('battle.participantsOtherFaction').length;
    }.property('battle'),

    own_army_count: function(){
      var armyCount = 0;
      var participants = this.getPath('battle.participantsOwnFaction');
          for(var i=0; i<participants.length; i++)
            armyCount += Object.keys(AWE.GS.ArmyManager.getArmiesOfCharacter(participants[i].character_id)).length;
      return armyCount;
    }.property('battle'),

    other_army_count: function(){
      var armyCount = 0;
      var participants = this.getPath('battle.participantsOtherFaction');
          for(var i=0; i<participants.length; i++)
            armyCount += Object.keys(AWE.GS.ArmyManager.getArmiesOfCharacter(participants[i].character_id)).length;
      return armyCount;
    }.property('battle'),

    own_bonus: function(){
      var ownStrength = 0;
      this.getPath('battle.participantsOwnFaction').forEach(function(participant) {
        ownStrength += participant.getPath('army.strength') || 0;
      });

      var bonus = 0;
      var id = this.getPath('battle.location_id');
      var settlement = AWE.GS.SettlementManager.getSettlementAtLocation(id);
      var bonusStrength = 0;
      var allianceID = settlement.alliance_id;
      var rawBonus = settlement.present_defense_bonus * 100;
      var participants = this.getPath('battle.participantsOwnFaction');
      for(var i=0; i<participants.length; i++)
      {
        if(allianceID !== null && participants[i].army.alliance_id === allianceID)
        {
          bonusStrength += participants[i].army.strength;
        }
        else
        {
          return 0;
        }
      }

      var percentageOfArmyValidForBonus = bonusStrength / ownStrength;
      return rawBonus * percentageOfArmyValidForBonus;

    }.property('battle'),

    other_bonus: function(){
      var otherStrength = 0;
      this.getPath('battle.participantsOtherFaction').forEach(function(participant) {
        otherStrength += participant.getPath('army.strength') || 0;
      });

      var bonus = 0;
      var id = this.getPath('battle.location_id');
      var settlement = AWE.GS.SettlementManager.getSettlementAtLocation(id);
      var bonusStrength = 0;
      var allianceID = settlement.alliance_id;
      var rawBonus = settlement.present_defense_bonus * 100;
      var participants = this.getPath('battle.participantsOtherFaction');
      for(var i=0; i<participants.length; i++)
      {
        if(allianceID !== null && participants[i].army.alliance_id === allianceID)
        {
          bonusStrength += participants[i].army.strength;
        }
        else
        {
          return 0;
        }
      }

      var percentageOfArmyValidForBonus = bonusStrength / otherStrength;
      return rawBonus * percentageOfArmyValidForBonus;

    }.property('battle'),

    army_of_opponent: function(){
      var initiator_id = this.getPath('battle.initiator_id');
      var opponent_id = this.getPath('battle.opponent_id');
      var participants = this.getPath('battle.participants.content');
      for(var i=0; i<participants.length; i++)
        if(participants[i].character_id == opponent_id)
          return participants[i].get('army');
      return null;
    }.property('battle'),

    didInsertElement: function() {
      this.startTimer();
    },
    
    willDestroyElement: function() {
      this.stopTimer();
    },


    startTimer: function() {
      var timer = this.get('timer');
      if (!timer) {
        timer = setInterval((function(self) {
          return function() {
            self.updateBattle();
          };
        }(this)), 1000*30);  // update every 30 seconds
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
        
    
    ratioLengthOwn: function(){
      return 'width: ' + Math.round(576 * (this.getPath('battle.ratio') || 0)) + 'px;';
    }.property('battle.ratio').cacheable(),

    ratioLengthOther: function(){
      return 'width: ' + Math.round(576 * (1 - (this.getPath('battle.ratio') || 0))) + 'px;';
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
    }.property('battle.ratio').cacheable(),
    
    updateBattle: function() {
      //debugger;
      var battleId = this.getPath('battle.id');
      if (battleId) {
        AWE.GS.BattleManager.updateBattle(battleId); 
      }  
    },
    
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



