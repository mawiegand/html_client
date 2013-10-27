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
		  
		  styles : function() {
			  var style = 
			  	'background: #cc8;' +
				'position: relative;' + 
				'padding: 5px;' + 
				'height: 150px;' + 
				'width: 400px;' +
				'top: 300px;' + 
				'left: 300px;' + 
				'border: 2px solid #995;' + 
				'z-index: 1000;';
			  return style;
		  }.property('style'),
		  // init parent
		  init: function() {
		    this._super();
		  },
		  // close dialog element
		  okClicked: function() {
		    this.destroy();
		  }
	  }
  );
  return module;  

}(AWE.UI.Ember || {}));
