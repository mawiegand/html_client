/** 
 * Copyright (c) 2012 5D Lab
 * Authored by Sascha Lange, Patrick Fox 
 */
$(document).ready(function() {
  
  var APP = window.APP || (window.App = {});

  APP.config = { 
    clientLosesAuthHeaderOnRedirect: false,
    identity_provider_base: 'https://localhost/identity_provider'
  };
  
  APP.setup = function () {

    window.AJAX_WRAPPER.activate();
    
    $(document).ajaxError(function(event, xhr, settings, exception) {
      if (xhr.status == 401) {
        APP.LoginForm.show();
      }
    });
    
    // connect Login view and controller
    APP.LoginForm.controller = APP.LoginController; 
    APP.LoginController.setView(APP.LoginForm);
    
    // connect Identity reload and controller
    $('#reload-button').click(function() {
      APP.IdentityController.fetchSelf();
    });
  };
  
  
  /***************************************************************************
   * Start the App.
   * 
   * First, runs a test to determine whether or not the client loses the 
   * authorization header on rediretcs. Then, sets config parameters 
   * accordingly, setups the app and starts it by requesting user 
   * authorization. if the test fails completely (no connection), fail 
   * with an alert.
   **************************************************************************/
      
  // bind a helper modifying the request headers. It's just used for the 
  // redirect test and unbinded directly afterwards.
  $(document).bind('ajaxSend', function(event, xhr) {
    xhr.setRequestHeader('Authorization', 'Bearer test_token');
    xhr.setRequestHeader('Accept', 'application/json');
  });
  
  // now start the redirect test and setupt & start the app after receiving
  // and analyzing the response.
  $.getJSON(APP.config.identity_provider_base + '/oauth2/redirect_test_start')
    .success(function(data, textStatus, jqXHR) {
      console.log(data);
      $(document).unbind('ajaxSend');
      if (!data.ok) {
        if (!data.authorization_header || 
            data.authorization_header != 'Bearer test_token') {
          APP.config.clientLosesAuthHeaderOnRedirect = true ;
        }
        if (!data.accept_header || data.accept_header != 'application/json') {
          alert('Lost accept header. The client really needs to handle this,'+
                ' otherwise the server might send HTML!!!');
          exit(1);
        }        
      }
      APP.setup();
      APP.LoginForm.show();
    })
    .error(function(jqXHR, textStatus, errorThrown) {
      alert('Server error. Could not connect.');
    });
     
  /**************************************************************************/   
  
});













