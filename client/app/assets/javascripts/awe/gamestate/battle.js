/* Author: Sascha Lange <sascha@5dlab.com>,
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {
    
  module.BattleAccess = {};

  // ///////////////////////////////////////////////////////////////////////
  //
  //   BATTLE
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Battle = module.Entity.extend({     // extends Entity to Army
    typeName: 'Battle',
    name: null,
    
    rounds: null,
    participants: null,
    factions: null,
    armies: null,
    
    ownBattle: function() {
      var own = false;
      this.get('participants').forEach(function(participant) {
        if (participant && participant.getPath('army.owner_id') === AWE.GS.CharacterManager.getCurrentCharacter().getId()) {
          own = true;
        };        
      })
      return own;
    }.property('participants', 'participants.content', 'updated_at').cacheable(),
    
    ratio: function(){
      log('RATIO RECALC');
      var ownStrength = 0;
      this.get('participantsOwnFaction').forEach(function(participant) {
        ownStrength += participant.getPath('army.strength') || 0;
      });
      var otherStrength = 0;
      this.get('participantsOtherFaction').forEach(function(participant) {
        otherStrength += participant.getPath('army.strength') || 0;
      });
      log('NEW RATIO', (ownStrength + otherStrength > 0) ? ownStrength / (ownStrength + otherStrength) : 0.5, this.get('participantsOwnFaction'));
      return (ownStrength + otherStrength > 0) ? ownStrength / (ownStrength + otherStrength) : 0.5;
    }.property('participantsOwnFaction.@each.strength', 'participantsOtherFaction.@each.strength').cacheable(),
    
    ownFactionId: function() {
      var factionId;
      if (this.get('ownBattle')) {
        factionId = this.getPath('ownParticipants.firstObject.faction_id');
      }
      else {
        var factions = this.get('factions').filter(function(faction){
          return faction != undefined && faction != null;
        });
        factionId = factions.getPath('firstObject.id') || null;
      }
      return factionId; 
    }.property('ownBattle', 'ownParticipants.firstObject.faction_id', 'factions.@each.id').cacheable(),
    
    /** returns the faction, that is identified by ownFactionId as the own faction. */
    ownFaction: function() {
      var factions  = this.get('factions');
      var factionId = this.get('ownFactionId');
      if (!factions || !factionId) {
        return null;
      }
      var result = factions.filter(function(faction) {
        return faction && faction.get('id') === factionId;
      });
      return result && result.length == 1 ? result[0] : null;
    }.property('ownFactionId', 'factions.content').cacheable(),
    
    otherFaction: function() {
      var factions  = this.get('factions');
      var factionId = this.get('ownFactionId');
      if (!factions || !factionId) {
        return null;
      }
      var result = factions.filter(function(faction) {
        return faction && faction.get('id') !== factionId;
      });
      return result && result.length == 1 ? result[0] : null;
    }.property('ownFactionId', 'factions.content').cacheable(),    
    
    ownParticipants: function(){
      var self = this;
      return this.get('participants').filter(function(participant) {
        return participant && participant.getPath('army.owner_id') === AWE.GS.CharacterManager.getCurrentCharacter().getId(); 
      });
    }.property('participants', 'participants.content').cacheable(),
    
    participantsOwnFaction: function() {
      var self = this;
      log('PARTICIPANTS OWN FACTION', this.get('participants'), this.getPath('participants.length'), this.getPath('participants.content'));
      return this.get('participants').filter(function(participant) {
        return participant && participant.get('faction_id') === self.get('ownFactionId');        
      });
    }.property('participants', 'participants.content.length', 'ownFactionId').cacheable(),
    
    participantsOtherFaction: function(){
      var self = this;
      return this.get('participants').filter(function(participant) {
        return participant && participant.get('faction_id') !== self.get('ownFactionId');        
      })
    }.property('participants', 'participants.content', 'ownFactionId').cacheable(),
    
    participantsOfFactionWithArmy: function(army) {
      var self = this;
      var participant = army.get('battleParticipant');
      
      return this.get('participants').filter(function(p) {
        return p && p.get('faction_id') === participant.get('faction_id');        
      })
    },
    
    participantsOfFactionAgainstArmy: function(army) {
      var self = this;
      var participant = army.get('battleParticipant');
      
      return this.get('participants').filter(function(p) {
        return p && p.get('faction_id') !== participant.get('faction_id');        
      })
    },
    
    lastRound: function(){
      var lastRound = null;
      this.get('rounds').forEach(function(round) {
        if (round && (!lastRound || round.get('round_num') > lastRound.get('round_num'))) {
          lastRound = round;
        }
      });
      return lastRound;
    }.property('rounds', 'rounds.length').cacheable(),
    
    nextRoundNumber: function() {
      return (this.getPath('lastRound.number') || 0) +1;
    }.property('lastRound.number').cacheable(),
    
  });     

  module.BattleRounds = module.Entity.extend({ // warum plural?  
    typeName: 'BattleRounds',
    
    number: function() {
      var num = this.get('round_num');
      return num ? num + 1 : null;
    }.property('round_num').cacheable(),
    

  });    

  module.BattleParticipants = module.Entity.extend({
    typeName: 'BattleParticipants',

    army_id: null,
    battle_id: null,
    faction_id: null,
    joined_at: null,
    retreated: null,
    retreated_to_region_id: null,
    retreated_to_location_id: null,
    created_at: null,
    updated_at: null,
    total_experience_gained: null,
    disbanded: null,
    
    init: function(spec) {
      this._super(spec);
    },

    hashableArmiesAtBattle: function() {
      var battleId = this.get('battle_id');
      return battleId ? AWE.GS.ArmyAccess.getHashableCollectionForBattle_id(battleId) : null;
    }.property('battle_id').cacheable(),

    
    army: function() {
      var disbanded = this.get('disbanded');
      if (disbanded) {
        return null;
      }
      var army = AWE.GS.ArmyManager.getArmy(this.get('army_id'));
      if (!army) {
        AWE.GS.ArmyManager.updateArmy(this.get('army_id'));
        log('REQUEST MISSING ARMY FOR BATTLE');
      }
      return army;
    }.property('disbanded', 'army_id', 'hashableArmiesAtBattle.changed_at').cacheable(),
    
    isOwn: function(){
      return this.get('army').isOwn();
    }.property('army').cacheable(),
  });    

  module.BattleFactions = module.Entity.extend({
    typeName: 'BattleFactions',
  });    

    
  // ///////////////////////////////////////////////////////////////////////
  //
  //   ARMY MANAGER
  //
  // ///////////////////////////////////////////////////////////////////////  

  module.BattleManager = (function(my) {    // Army.Manager    -> manager singleton
  
    // private attributes and methods //////////////////////////////////////
  
    var that;


    // protected attributes and methods ////////////////////////////////////

    my = my || {};
  
    my.createEntity = function() {
      return module.Battle.create({
        rounds: Ember.ArrayProxy.create({
          baseTypeName: 'BattleRounds',
          content: [],
        }),
        factions: Ember.ArrayProxy.create({
          baseTypeName: 'BattleFactions',
          content: [],
        }),
        participants: Ember.ArrayProxy.create({
          baseTypeName: 'BattleParticipants',
          content: [],
        }),
      });        
    }
  
    // public attributes and methods ///////////////////////////////////////
  
    that = module.createEntityManager(my);
  
    that.getBattle = function(id) { return that.getEntity(id); }
    
    /** returns true, if update is executed, returns false, if request did 
     * fail (e.g. connection error) or is unnecessary (e.g. already underway).
     */
    that.updateBattle = function(id, updateType, callback) {
      var url = AWE.Config.MILITARY_SERVER_BASE+'battles/'+id;
      return my.updateEntity(url, id, updateType, callback); 
    };
    
    return that;
      
  }());
    
  
  return module;
  
}(AWE.GS || {}));




