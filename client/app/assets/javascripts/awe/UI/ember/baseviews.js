/**
 * @fileOverview 
 * Ember.JS views for the home-base screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {}; 

/** @namespace */
AWE.UI.Ember = (function(module) /** @lend AWE.UI.Ember */ {
  
  /**
   * View for displaying a Settlement of type "base". This is only partially
   * dynamic. It is closely connected to the actuall definitions in the 
   * rules_buildings.xml and must change, in case the number of type of slots
   * changes there.
   *
   * @class
   * @extends AWE.UI.Ember.SettlementView
   * @name AWE.UI.Ember.BaseView 
   */
	module.BaseView = AWE.UI.Ember.SettlementView.extend( /** @lends AWE.UI.Ember.BaseView# */ {
    templateName : "base-screen",

    wallSlot: function() {
      var slots = this.get('slots');
      return slots && slots.length > 0 ? slots[0] : null;
    }.property('slots').cacheable(),
		
    smallSlots: function() {
      var slots = this.get('slots');
      return slots && slots.length > 0 ? slots.slice(1,slots.length) : null;
    }.property('slots').cacheable(),
    
    questAdvisorClicked: function() {
      WACKADOO.showQuestListDialog();
    },
    
    displayQuestAdvisor: function() {
      var character = AWE.GS.game.get('currentCharacter');
      if (!character) { return false; }
      var platinum = character.get('isPlatinumActive');
      var state = character.get('max_conversion_state');
      return !platinum || !state || (state !== "active" && state !== "long_term" && state !== "paying");
    }.property('AWE.GS.game.currentCharacter.isPlatinumActive'),
						
	});
    
  return module;
    
}(AWE.UI.Ember || {}));

