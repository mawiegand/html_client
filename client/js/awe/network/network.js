/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Network = AWE.Network || function() {
  

  
  return {
    
    /** initialize the network layer */
    init: function() {
      $(document).bind('ajaxSend', function(event, xhr) { // bind a handler that always sets the correct accept type
        xhr.setRequestHeader('Accept', 'application/json');
      });   
    },
    
  };
  
}();

