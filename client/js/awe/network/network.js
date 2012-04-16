/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Net = AWE.Net || function(module) {
  
  module.OK           = 200;
  module.CREATED      = 201;
  
  module.NOT_MODIFIED = 304;
  
  /** initialize the network layer */
  module.init = function() {
    $(document).bind('ajaxSend', function(event, xhr) { // bind a handler that always sets the correct accept type
      xhr.setRequestHeader('Accept', 'application/json');
    });   
  };
  
  return module;
  
}(AWE.Net || {});

