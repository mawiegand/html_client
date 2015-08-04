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
      {
        var charArmies = AWE.GS.ArmyManager.getArmiesOfCharacter(participants[i].character_id);
        Object.keys(charArmies).forEach(function(key){
          if(!charArmies[key].isGarrison())
          {
            armyCount++;
          }
        });
      }
      return armyCount;
    }.property('battle.participantsOwnFaction'),

    other_army_count: function(){
      var armyCount = 0;
      var participants = this.getPath('battle.participantsOtherFaction');
      for(var i=0; i<participants.length; i++)
      {
        var charArmies = AWE.GS.ArmyManager.getArmiesOfCharacter(participants[i].character_id);
        Object.keys(charArmies).forEach(function(key){
          if(!charArmies[key].isGarrison())
          {
            armyCount++;
          }
        });
      }
      return armyCount;
    }.property('battle.participantsOtherFaction'),

    own_bonus: function(){
      var ownStrength = 0;
      this.getPath('battle.participantsOwnFaction').forEach(function(participant) {
        ownStrength += participant.getPath('army.strength') || 0;
      });

      var id = this.getPath('battle.location_id');
      var settlement = AWE.GS.SettlementManager.getSettlementAtLocation(id);
      var bonusStrength = 0;
      var rawBonus = 0;
      if(settlement && typeof settlement !== "undefined"){
        var allianceID = settlement.alliance_id;
        rawBonus = settlement.present_defense_bonus * 100;
        var participants = this.getPath('battle.participantsOwnFaction');
        for(var i=0; i<participants.length; i++)
        {
          if(allianceID !== null && participants[i].getPath('army.alliance_id') === allianceID)
          {
            bonusStrength += participants[i].getPath('army.strength');
          }
        }
      }

      if(ownStrength > 0){
        var percentageOfArmyValidForBonus = bonusStrength / ownStrength;
        return rawBonus * percentageOfArmyValidForBonus;        
      }
      else {
        return rawBonus;
      }
    }.property('battle'),

    other_bonus: function(){
      var otherStrength = 0;
      this.getPath('battle.participantsOtherFaction').forEach(function(participant) {
        otherStrength += participant.getPath('army.strength') || 0;
      });

      var id = this.getPath('battle.location_id');
      var settlement = AWE.GS.SettlementManager.getSettlementAtLocation(id);
      var bonusStrength = 0;
      var rawBonus = 0;
      if(settlement && typeof settlement !== "undefined"){
        var allianceID = settlement.alliance_id;
        rawBonus = settlement.present_defense_bonus * 100;
        var participants = this.getPath('battle.participantsOtherFaction');
        for(var i=0; i<participants.length; i++)
        {
          if(allianceID !== null && participants[i].getPath('army.alliance_id') === allianceID)
          {
            bonusStrength += participants[i].getPath('army.strength');
          }
          else
          {
            return 0;
          }
        }        
      }
      if(otherStrength > 0){
        var percentageOfArmyValidForBonus = bonusStrength / otherStrength;
        return rawBonus * percentageOfArmyValidForBonus;        
      }
      else {
        return rawBonus;
      }
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

  return module;
    
}(AWE.UI.Ember || {}));