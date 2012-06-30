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
  //   ARMY
  //
  // ///////////////////////////////////////////////////////////////////////    
    
  module.Battle = module.Entity.extend({     // extends Entity to Army
    typeName: 'Battle',
    name: null,
    
    rounds: null,
    participants: null,
    factions: null,
    
    ownBattle: function() {
      var own = false;
      this.get('participants').forEach(function(participant) {
        if (participant && participant.getPath('army.owner_id') === AWE.GS.CharacterManager.getCurrentCharacter().getId()) {
          own = true;
        };        
      })
      return own;
    }.property('id').cacheable(),
    
    ratio: function(){
      var ownStrength = 0;
      this.get('participantsOwnFaction').forEach(function(participant) {
        ownStrength += participant.getPath('army.strength');
      });
      var otherStrength = 0;
      this.get('participantsOtherFaction').forEach(function(participant) {
        otherStrength += participant.getPath('army.strength');
      });
      return ownStrength / (ownStrength + otherStrength);
    }.property('id').cacheable(),
    
    ownFactionId: function() {
      var factionId;
      if (this.get('ownBattle')) {
        factionId = this.getPath('ownParticipants.firstObject.faction_id');
      }
      else {
        var factions = this.get('factions').filter(function(faction){
          return faction != undefined && faction != null;
        });
        factionId = factions.get('firstObject').get('id');
      }
      return factionId; 
    }.property('participants').cacheable(),
    
    ownParticipants: function(){
      var self = this;
      return this.get('participants').filter(function(participant) {
        return participant && participant.getPath('army.owner_id') === AWE.GS.CharacterManager.getCurrentCharacter().getId(); 
      })
    }.property('participants').cacheable(),
    
    participantsOwnFaction: function() {
      var self = this;
      return this.get('participants').filter(function(participant) {
        return participant && participant.get('faction_id') === self.get('ownFactionId');        
      })
    }.property('participants').cacheable(),
    
    participantsOtherFaction: function(){
      var self = this;
      return this.get('participants').filter(function(participant) {
        return participant && participant.get('faction_id') !== self.get('ownFactionId');        
      })
    }.property('participants').cacheable(),
    
    lastRound: function(){
      var lastRound = null;
      this.get('rounds').forEach(function(round) {
        if (round && (!lastRound || round.get('round_num') > lastRound.get('round_num'))) {
          lastRound = round;
        }
      });
      return lastRound;
    }.property('rounds').cacheable(),
  });     

  module.BattleRounds = module.Entity.extend({
    typeName: 'BattleRounds',
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
    
    init: function(spec) {
      this._super(spec);
    },
    
    army: function(){
      return AWE.GS.ArmyManager.getArmy(this.get('army_id'));
    }.property('army_id').cacheable(),
    
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




