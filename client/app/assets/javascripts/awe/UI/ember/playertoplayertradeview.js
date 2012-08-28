/**
 * @fileOverview 
 * Ember.JS views for displaying details about player to player trading.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {}; 

AWE.UI.Ember = (function(module) {
  
  
  /** @class
   * @name AWE.UI.Ember.DiplomacyView */  
  module.PlayerToPlayerTradeView = Ember.View.extend( /** @lends AWE.UI.Ember.DiplomacyView# */ {
    templateName: "player-to-player-trade-view",
  });  
  
  
  return module;
    
}(AWE.UI.Ember || {}));




