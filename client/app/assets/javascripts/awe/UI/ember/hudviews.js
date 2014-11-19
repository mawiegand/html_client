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
});

return module;

}(AWE.UI.Ember || {}));