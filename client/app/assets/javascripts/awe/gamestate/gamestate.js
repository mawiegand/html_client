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

  return module;
  
}(AWE.GS || {}));


