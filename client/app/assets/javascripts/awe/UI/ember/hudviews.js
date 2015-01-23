/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

module.LeftHUDView = Ember.View.extend({
  templateName: 'left-hud-view',
  
  controller: null,
  screenController: null,
  mode: null,
  uiMarkerEnabled: false,
  character: null,
  settlement: null,

  setHUDMode: function(currentMode) {
    this.set('mode', currentMode);
  },

  setSettlement: function(settlementId) {
    var self = this;
    AWE.GS.SettlementManager.updateSettlement(settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
      var settlement = AWE.GS.SettlementManager.getSettlement(settlementId);
      self.set('settlement', settlement);
    });
  },

  isSettlement: function(){
    var mode = this.get('mode');
    return mode === AWE.UI.HUDModeSettlement;
  }.property('mode').cacheable(),

  unlockedAssignments: function(){
    var character = this.get('character');
    var settlement = this.get('settlement');
    if(settlement)
    {
      var slots = settlement.get('enumerableSlots');
      for(var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        if(slot.getPath('building.unlockedAssignments'))
        {
          this.set('tavernBuilding', slot.get('building'));
          return true;
        }
      }
    }
    return false;
  }.property('settlement.enumerableSlots.@each.building'),

  unlockedTrade: function() {
    var character = this.get('character');
    var settlement = this.get('settlement');
    if(settlement)
    {
      var slots = settlement.get('enumerableSlots');
      for(var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        if(slot.getPath('building.unlockedPlayerToPlayerTrade'))
        {
          return true;
        }
      }
    }
    return false;
  }.property('settlement.enumerableSlots.@each.building'),
  
  isUiMarkerEnabled: function() {
    return this.get('uiMarkerEnabled');
  }.property('uiMarkerEnabled'),

  menuClicked: function(){
    this.get('controller').menuButtonClicked();
  },

  rankingClicked: function(){
    this.get('controller').rankingButtonClicked();
  },

  switchMapModeClicked: function(){
    this.get('controller').switchMapModeButtonClicked();
  },

  gamingPieceSelectorClicked: function(){
    this.get('controller').gamingPieceSelectorButtonClicked();
  },

  recruitClicked: function(){
    this.get('controller').recruitButtonClicked();
  },

  assignmentClicked: function() {
    this.get('controller').assignmentButtonClicked(this.get('tavernBuilding'));
  },

  tradeClicked: function() {
    this.get('controller').tradeButtonClicked();
  },

  switchToSettlement: function(){
    this.get('controller').switchToSettlementButtonDoubleClicked();
    //switchToMapButtonClicked
  },

  switchToMap: function(){
    this.get('controller').switchToMapButtonClicked();
  },
});

module.RightHUDView = Ember.View.extend({
  templateName: 'right-hud-view',
  
  controller: null,
  character: null,
  tutorialState: null,

  getUnreadMessageCount: function(){
    var unreadMessages = this.getPath('character.inbox.unread_messages_count');
    if (unreadMessages === undefined) return false;
    return unreadMessages > 0 ? unreadMessages : false;
  }.property('character.inbox.unread_messages_count').cacheable(),

  getNotClosedQuest: function(){
    var numberOfQuests = this.getPath('tutorialState.notClosedQuestStateCount');
    if (numberOfQuests === undefined) return false;
    return numberOfQuests > 0 ? numberOfQuests : false;
  }.property('tutorialState.notClosedQuestStateCount').cacheable(),

  mailClicked: function(){
    this.get('controller').mailButtonClicked();
  },

  questsClicked: function(){
    this.get('controller').questsButtonClicked();
  },
  
});

module.TopRightHUDView = Ember.View.extend({
  templateName: 'top-right-hud-view',
  
  controller: null,
  character: null,
  tutorialState: null,

  allianceClicked: function(){
    this.get("controller").allianceFlagClicked(this.getPath("character.alliance_id"));
  },
  
});
return module;

}(AWE.UI.Ember || {}));