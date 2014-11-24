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

	menuClicked: function(){
		this.get('controller').menuButtonClicked();
	},

	rankingClicked: function(){
		this.get('controller').rankingButtonClicked();
	},

	switchMapModeClicked: function(){
		this.get('controller').switchMapModeButtonClicked();
	},

	recruitClicked: function(){
		this.get('controller').recruitButtonClicked();
	},
});

return module;

}(AWE.UI.Ember || {}));