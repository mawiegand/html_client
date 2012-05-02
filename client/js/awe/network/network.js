/* Author: Sascha Lange <sascha@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

 
var AWE = window.AWE || {};

AWE.Net = AWE.Net || function(module) {
  
  module.OK           = 200;
  module.CREATED      = 201;
  
  module.NOT_MODIFIED = 304;
  
  module.clientLosesAuthHeaderOnRedirect = false;
  
  /** initialize the network layer */
  module.init = function() {
    
    $(document).bind('ajaxSend', function(event, xhr) {
      if (AWE.Config.DEV_ACCESS_TOKEN) {
        if (!module.clientLosesAuthHeaderOnRedirect) {   // otherwise, the access token will be in the data section / query string
          var token = AWE.Config.DEV_ACCESS_TOKEN ?  AWE.Config.DEV_ACCESS_TOKEN : "";
          xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
      }
      xhr.setRequestHeader('Accept', 'application/json');
    });
        
    /** extension of $.ajax to allow setting and automatic inclusions of default arguments. */
    (function ($) { 
      var _ajax = $.ajax; 
      $.extend({
        ajax: function(options) {  //ATTENTION: DOES NOT WORK CORRECTLY FOR $.ajax(url, settings) !!!
          if ($.ajax.data) {
            if(options.data) { 
              if(typeof options.data !== 'string') 
                options.data = $.param(options.data); 

              if(typeof $.ajax.data !== 'string') 
                $.ajax.data = $.param(this.data); 

              options.data += '&' + $.ajax.data; 
            } 
            else {
              options.data = $.ajax.data; 
            }
          }
          return _ajax.call(this,options); 
        }
      }); 
    })(jQuery);
  };
  
  return module;
  
}(AWE.Net || {});

