/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

module.HUDViews = Ember.View.extend({
	templateName: 'hud-view',
	
	controller: null,
	mode: null,

	setHUDMode: function(currentMode)
	{
		this.set('mode', currentMode);
	},

	isSettlement: function(){
		var mode = this.get('mode');
		return mode === AWE.UI.HUDModeSettlement;
	}.property('mode').cacheable(),

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

return module;

}(AWE.UI.Ember || {}));