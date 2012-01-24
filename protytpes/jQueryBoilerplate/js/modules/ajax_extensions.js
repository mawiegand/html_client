/** 
 * Copyright (c) 2012 5D Lab
 * Authored by Sascha Lange, Patrick Fox 
 */
var AJAX_WRAPPER = window.AJAX_WRAPPER || (window.AJAX_WRAPPER = 
  function() {
    
    var _token = null;
    
    /** extension of $.ajax to allow setting and automatic inclusions of default arguments. */
    (function ($) { 
      var _ajax = $.ajax; 
      $.extend({
        ajax: function(options) {
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
  
    /** extension of $.getJSON to allow setting and automatic inclusions of default arguments. */
    (function ($) { 
      var _getJSON = $.getJSON; 
      $.extend({
        getJSON: function(options) {
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
          return _getJSON.call(this,options); 
        }
      }); 
    })(jQuery);    
    
    var ajaxSend = function(event, xhr) {
      if (!APP.config.clientLosesAuthHeaderOnRedirect && _token != null && _token != "") {   // otherwise, the access token will be in the data section / query string
        xhr.setRequestHeader('Authorization', 'Bearer ' + _token);
      }
      xhr.setRequestHeader('Accept', 'application/json');
    };

    return {
      setBearerToken: function(token) {
        _token = token;
        if (APP.config.clientLosesAuthHeaderOnRedirect) {
          $.ajax.data = { 
            access_token: token 
          };
        }
      },
      activate: function() {
        $(document).bind('ajaxSend',ajaxSend);
      },
      deactivate: function() {
        $(document).unbind('ajaxSend');
      }
    };
  }()
);



