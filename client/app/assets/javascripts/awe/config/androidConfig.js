/* Author: Marc Wißler <marc@5dlab.com>
 * Copyright (C) 2014 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */


var AWE = window.AWE || {};
AWE.Settings = AWE.Settings || {};

AWE.Settings = (function(module) { 

  module.getStyleSheet = function(unique_title) {
	  for(var i=0; i<document.styleSheets.length; i++) {
	    var sheet = document.styleSheets[i];
	    if(sheet.title === unique_title) {
	      return sheet;
	    }
	  }
	}

  module.adaptStylesheet = function() {
    var stylesheet = module.getStyleSheet("application");
    stylesheet.addRule(".welcome-screen", "width: 200px;", 1);
  }

  return module;
  
}(AWE.Settings || {}));

