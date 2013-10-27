/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
	
  module.TutorialSettleDialog = module.Dialog.extend(
	  {
		  // tpl name == data-tempalte-name in view
		  templateName: 'tutorialsettle-info-dialog',
			originX: 0,
			originY: 0,
			isDestroyed: false,
		  // returns origin style data
			// @todo: move static data to css & add css class
		  styles : function() {
			  var style = 
					'top: ' + (this.get('originY') || 100) + 'px;' + 
					'left: ' + (this.get('originX') + 100 || 100) + 'px;'; // + 100 means vector for container
			  return style;
		  }.property('originX', 'originY').cacheable(),
			
		  // init parent
		  init: function() {
		    this._super();
		  },
			
		  // close dialog element
		  okClicked: function() {
		    this.destroy();
		  },

		  setOrigin: function(coords) {
				this.set('originX', coords.x);
				this.set('originY', coords.y);
		  },
			
		  getOrigin: function() {
				return AWE.Geometry.createPoint(this.get('originX'), this.get('originY'));
		  },

			// calculates changes from last update => only update when a minimum of 20 is moved
			originDiffers: function(x, y) {
				var minDifference = 0;
				return (
					Math.abs(this.get('originX') - x) > minDifference
					|| Math.abs(this.get('originY') - y) > minDifference
				);
			}

	  }
  );
  return module;  

}(AWE.UI.Ember || {}));
