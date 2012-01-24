steal(
  './htmlclient.css', // application CSS file
  './models/models.js', // steals all your models
  './controller/login.js', // sets up fixtures for your models
  'jquery',
  './scripts/ui-lightness/jquery-ui-1.8.16.custom.css', 
  function() {
    
    window.config = { 
      userAuth: null,
      clientLosesAuthHeaderOnRedirect: false,
      identity_provider_base: 'https://localhost/identity_provider',
    };
  
    (function($) {
      var _ajax = $.ajax;
      $.extend({
        ajax : function(options) {
          if($.ajax.data) {
            if(options.data) {
              if( typeof options.data !== 'string')
                options.data = $.param(options.data);
  
              if( typeof $.ajax.data !== 'string')
                $.ajax.data = $.param(this.data);
  
              options.data += '&' + $.ajax.data;
            } else {
              options.data = $.ajax.data;
            }
          }
          return _ajax.call(this, options);
        }
      });
    })(jQuery);
  
    /** extension of $.getJSON to allow setting and automatic inclusions of default arguments. */
    (function($) {
      var _getJSON = $.getJSON;
      $.extend({
        getJSON : function(options) {
          if($.ajax.data) {
            if(options.data) {
              if( typeof options.data !== 'string')
                options.data = $.param(options.data);
  
              if( typeof $.ajax.data !== 'string')
                $.ajax.data = $.param(this.data);
  
              options.data += '&' + $.ajax.data;
            } else {
              options.data = $.ajax.data;
            }
          }
          return _getJSON.call(this, options);
        }
      });
    })(jQuery);
  
    $(document).bind('ajaxSend', function(event, xhr) {
      if(config.userAuth && config.userAuth['access_token']) {
        if(!config.clientLosesAuthHeaderOnRedirect) {// otherwise, the access token will be in the data section / query string
          var token = (config.userAuth && config.userAuth.access_token) ? config.userAuth.access_token : "";
          xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
      }
      xhr.setRequestHeader('Accept', 'application/json');
    });
  
    $(document).ajaxError(function(event, xhr, settings, exception) {
      if(xhr.status == 401) {
        $('body').htmlclient_login();
      }
    });
  
    $(document).bind('ajaxSend', function(event, xhr) {
      xhr.setRequestHeader('Authorization', 'Bearer test_token');
      xhr.setRequestHeader('Accept', 'application/json');
    });
    
    // now start the redirect test and setupt & start the app after receiving
    // and analyzing the response.
    $.getJSON(config.identity_provider_base + '/oauth2/redirect_test_start')
    .success(function(data, textStatus, jqXHR) {
      $(document).unbind('ajaxSend');
      if(!data.ok) {
        if(!data.authorization_header || data.authorization_header != 'Bearer test_token') {
          config.clientLosesAuthHeaderOnRedirect = true;
        }
        if(!data.accept_header || data.accept_header != 'application/json') {
          alert('Lost accept header. The client really needs to handle this,' +
            ' otherwise the server might send HTML!!!');
          exit(1);
        }
      }
      // Controller starten
      $('body').htmlclient_login();
    })
    .error(function(jqXHR, textStatus, errorThrown) {
      console.log('error: ' + textStatus);
    });
  }
);