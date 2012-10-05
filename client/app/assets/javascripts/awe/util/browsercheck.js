/* Author: Sascha Lange <sascha@5dlab.com>
 *         Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */
 
var AWE = window.AWE || {};

AWE.Util = AWE.Util || {};

/** extensions of JavaScript base types. */
AWE.Util.Browser = (function(module) {

  module.checkRequirements = function() {
    
    requirementsSatisfied = !!(
      Modernizr.canvas &&
      Modernizr.canvastext &&
      Modernizr.inlinesvg &&
      Modernizr.svg
    );
    
    return requirementsSatisfied;
  }

  return module;
      
}(AWE.Util.Browser || {}));
