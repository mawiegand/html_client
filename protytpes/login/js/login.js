$(document).ready(function() {

  var RAILS_APP = 'http://localhost:3000/identity_provider';
  
  var currentUser = null;
  var clientLosesAuthHeaderOnRedirect = true;   // TODO: should test automatically

  
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
    if (currentUser && currentUser['access_token']) {
      if (!clientLosesAuthHeaderOnRedirect) {   // otherwise, the access token will be in the data section / query string
        var token = (currentUser && currentUser['access_token']) ? currentUser['access_token'] : "";
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }
    xhr.setRequestHeader('Accept', 'application/json');
  });
  
  var setCurrentUser = function(data) {
    currentUser = data;

    if (clientLosesAuthHeaderOnRedirect) { // auto-append access-token to query string / post data
      $.ajax.data = { access_token: data['access_token'] };
    }
    $.getJSON(RAILS_APP + '/identities/self')
    .success(function(data, textStatus, jqXHR) {
      alert("Success: " + $.param(data));
    })
    .error(function(jqXHR, textStatus, errorThrown) {
      alert("Error: " + $.param(data));
    });
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
        url: RAILS_APP + '/oauth2/access_token',
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
    });

    $('input').blur();
    
  };
  
  obtainUserAuthorization();
  
  //('<div id="login-dialog"></div>').appendTo('body').dialog();
});
