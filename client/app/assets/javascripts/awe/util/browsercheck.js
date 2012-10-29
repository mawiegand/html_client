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
      Modernizr.svg &&
      !(window.opera && window.opera.buildNumber)
    );
    
    if (!(AWE.Config.BROWSER_CHECK_FAILURES_ONLY && requirementsSatisfied)) {
      module.logCheck(requirementsSatisfied);
    }
    
    return requirementsSatisfied;
  }

  module.logCheck = function(success) {
    var options = {
      url: AWE.Config.BACKEND_SERVER_BASE + 'browser_stats',
      type: 'POST',
      data: {
        backend_browser_stat: {
          success: success,
          user_agent: navigator.userAgent,
          modernizr: JSON.stringify(Modernizr),
        },
      },
      dataType: 'json',
    };
    
    var jqXHR = $.ajax(options)
      .error(function(jqXHR, statusText) {           // On failure:
        log('ERROR TRACKING EVENT TO URL ' + AWE.Config.BACKEND_SERVER_BASE + '/browser_stats'); 
      })
      .success(function(data, statusText, jqXHR) {   // On success:
        log('SUCCESS TRACKING EVENT TO URL ' + AWE.Config.BACKEND_SERVER_BASE + '/browser_stats'); 
      })
  }

  return module;
      
}(AWE.Util.Browser || {}));
