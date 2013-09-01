/**
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 
 
var AWE = window.AWE || {};

AWE.GS = (function(module) {

  /** ember object for information that is not kept in any entity manager
   * @name AWE.GS.game */ 
  module.game = Ember.Object.create({
    currentCharacter: null,
    currentArtifact: null,
    roundInfo: null,
    victoryProgressLeaders: null,
    characterRanking: null,
    allianceRanking: null,
    fortressRanking: null,
    rankingInfo: null,
    gossip: null,
  });

  module.TimeManager = AWE.Util.TimeCorrection.createManager();
  
  
  module.cleanupMapData = function() {
    module.ArmyManager.cleanup();
  }
  
  module.cleanupSlotData = function() {
    module.SlotManager.removeAllEntities();
  }

  module.cleanupMessageData = function() {
    module.MessageManager.removeAllEntities();
  }

  module.cleanupRankingData = function() {
    module.CharacterRankingEntryManager.removeAllEntities();
    module.AllianceRankingEntryManager.removeAllEntities();
    module.FortressRankingEntryManager.removeAllEntities();
    module.ArtifactRankingEntryManager.removeAllEntities();
  }

  module.cleanupGeneralData = function() {
    if (!module.game || !module.game.getPath('currentCharacter')) {
      return ; // don't run during initialization where no character is present.
    }
    
    var characters = AWE.Ext.hashValues(module.CharacterManager.getEntities());
    
    character.forEach(function(character) {
      if (character.get('id') && character.get('id') !== module.game.getPath('currentCharacter.id')) {
        module.CharacterManager.removeEntity(character); // will automatically call destroy on the entity.
      }
    });
  }


  return module;
  
}(AWE.GS || {}));


