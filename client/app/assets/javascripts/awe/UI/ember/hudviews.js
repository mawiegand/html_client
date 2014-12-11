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
	mode: null,
	uiMarkerEnabled: false,

	setHUDMode: function(currentMode) {
		this.set('mode', currentMode);
	},	

	isSettlement: function(){
		var mode = this.get('mode');
		return mode === AWE.UI.HUDModeSettlement;
	}.property('mode').cacheable(),
	
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

	isAllianceMember: function(){
		if(this.getPath("character"))
		{
			return true;
		}
		return false;
	}.property('character').cacheable(),

	allianceClicked: function(){
		this.get("controller").allianceFlagClicked();
	}
	
});
return module;

}(AWE.UI.Ember || {}));