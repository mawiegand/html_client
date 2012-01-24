/** 
 * Copyright (c) 2011 5D Lab
 * Authored by Sascha Lange, Patrick Fox */
$(document).ready(function() {
  
  var APP = {};

  APP.currentUser = null;
  APP.config = { 
    clientLosesAuthHeaderOnRedirect: false,
    identity_provider_base: 'https://localhost/identity_provider'
  };
  
  APP.setup = function () {
    
    var that = this;
        
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
  
  
    $(document).bind('ajaxSend', function(event, xhr) {
      if (that.currentUser && that.currentUser['access_token']) {
        if (!that.config.clientLosesAuthHeaderOnRedirect) {   // otherwise, the access token will be in the data section / query string
          var token = (that.currentUser && that.currentUser['access_token']) ? that.currentUser['access_token'] : "";
          xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
      }
      xhr.setRequestHeader('Accept', 'application/json');
    });
  
    $(document).ajaxError(function(event, xhr, settings, exception) {
      if (xhr.status == 401) {
        obtainUserAuthorization();
      }
    });
    
  }
  
  var fetchSelf = function() {
    $.getJSON(APP.config.identity_provider_base + '/identities/self')
      .success(function(data, textStatus, jqXHR) {
        $('#current_user-info').html("Signed-in as " + data['nickname'] + " / " + data['email']);
      })
      .error(function(jqXHR, textStatus, errorThrown) {
          // add something here
      });
  };
  
  $('#reload-button').click(function() {
    fetchSelf();
  });
  
  var setCurrentUser = function(data) {
    APP.currentUser = data;

    if (APP.config.clientLosesAuthHeaderOnRedirect) { // auto-append access-token to query string / post data
      $.ajax.data = { access_token: data['access_token'] };
    } 
    
    fetchSelf();

  };
  
  var attachClear = function() {
    $(this)
      .data('default', $(this).val())
      .addClass('inactive')
      .focus(function() {
        $(this).removeClass('inactive');
        if ($(this).val() == $(this).data('default') || '') {
          $(this).val('');
        }
      });
  }
  
  var obtainUserAuthorization = function () {
  
    if ($('#login-dialog').length == 0) {  // on first call attach some html to the document for the view
      $('body').append('<div id="login-dialog"> \
    	  <form id="login-form">\
  	      <div class="input-wrapper text ui-widget-content ui-corner-all">\
  		      <input type="text" name="username" id="username" value="" class="clear" />\
  	        <label for="username">Email or Nickname</label>\
          </div>\
          <div class="input-wrapper text ui-widget-content ui-corner-all">\
  		      <input type="password" name="password" id="password" value="" class="clear" />\
  	        <label for="password">Password</label>\
          </div>\
          <div id="login-message"></div>\
  	    </form>\
      </div>');

      // catch return - key to submit form (necessary for Safari, as invisible input submit element does not help)
      $('#login-dialog input').each(function() {
        $(this)
        .keydown(function(event) {
          if (event.keyCode == 13) {
            $('#login-form').submit();
          }
        });
      });  

      // clear hint text
      $('#login-dialog input.clear').each(function() {
        $(this)
        .keydown(function(event) {               // necessary to remove label immediately for the case, where the user holds the key
          if (event.keyCode != 13 &&
            event.keyCode != 8 &&
            event.keyCode != 9 &&
            event.keyCode != 16
          ) {
            $(this).siblings('label').hide();
          }
        })
        .keyup(function() {                      // user actually has entered (or deleted) something. determine whether or not tho show label.
          if ($(this).val() == '') {
            $(this).siblings('label').show();
          }
          else {
            $(this).siblings('label').hide();
          }
        })
        .blur(function() {                      // "repairs" incidental removal due to tab key
          if ($(this).val() == '') {
            $(this).siblings('label').show();
          }
          else {
            $(this).siblings('label').hide();
          }
        });
    });

    $('#login-form').submit(function() {
      if ($('#login-form #username').val() == '' ||
      $('#login-form #password').val() == '') {
        $('div#login-message').html('Please provide your credentials.');
        return false; // prevent default behaviour
      }
      var params = $('#login-form').serializeArray();
      params.push({
        name: 'client_id',
        value: 'XYZ'
      });
      params.push({
        name: 'scope',
        value: '5dentity wackadoo'
      });
      params.push({
        name: 'grant_type',
        value: 'password'
      });

      $.ajax({
        type: 'POST',
        url: APP.config.identity_provider_base + '/oauth2/access_token',
        data: params,
        success: function(data, textStatus, jqXHR) {
          switch(jqXHR.status) {
            case 200:
            if (data['access_token']) {
              setCurrentUser(data);
              $('#login-dialog').dialog('close');
            }
            break;
            default:
            msgObj = $.parseJSON(jqXHR.responseText);
            $('#login-message').text(msgObj.error + ": " + msgObj.error_description);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          switch(jqXHR.status) {
            case 400:
            default:
            errObj = $.parseJSON(jqXHR.responseText);
            $('#login-message').text(errObj.error + ": " + errObj.error_description);
          }                          
        }
      });
      return false; // prevent default behavior
    });

    $('#login-dialog').dialog({
      modal: true,
      resizable: false,
      autoOpen: false,
      dialogClass: 'login-dialog',
      closeOnEscape: false,
      draggable: false,
      title: 'Please Sign-In',
      width: 400,
      position: 'center',
      buttons:[
      {
        text: 'Send',
        click: function() {
          $('#login-form').submit();
        }
      }
      ]
    }).dialog('open');

    $('input').blur();
  }
  else {   // this is at least the second time the client displays the login-dialog
  
    $('#login-dialog').dialog('open');  
    $('input#password')
      .val('')    // reset password to prevent unauthorized access
      .siblings('label').show();
    
    if ($('input#username').val() == '') {
      $('input#username').focus(); // focus at username, if it hasn't been entered, yet
    }
    else {
      $('input#password').focus(); // focus at password, as we've resetted this value
    }
  }
    
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
      obtainUserAuthorization();
    })
    .error(function(jqXHR, textStatus, errorThrown) {
      alert('Server error. Could not connect.');
    });
     
  /**************************************************************************/   
  
});
