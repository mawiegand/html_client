$(document).ready(function() {
  
  var currentUser = null;
  var clientLosesAuthHeaderOnRedirect = true;
  
  $(document).bind('ajaxSend', function(event, xhr) {
    if (currentUser && currentUser['access_token']) {
      if (clientLosesAuthHeaderOnRedirect) {
        
      }
      else {
        var token = (currentUser && currentUser['access_token']) ? currentUser['access_token'] : "";
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      }
    }
    xhr.setRequestHeader('Accept', 'application/json');
  });
  
  var setCurrentUser = function(data) {
    currentUser = data;
    $.ajax({
      type: 'GET',
      url: 'http://localhost:3000/identities/self',
      success: function(data, textStatus, jqXHR) {
        alert($.param(data));
      },
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
	      <fieldset>\
	        <div class="input-wrapper text ui-widget-content ui-corner-all">\
		        <input type="text" name="username" id="username" value="" class="clear" />\
	        	<label for="username">Email or Nickname</label>\
          </div>\
          <div class="input-wrapper text ui-widget-content ui-corner-all">\
		        <input type="password" name="password" id="password" value="" class="clear" />\
	        	<label for="password">Password</label>\
          </div>\
          <div id="login-message"></div>\
	      </fieldset>\
	      </form>\
      </div>');
      
      
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
          if ($('#login-form #username').val() == '' ||
              $('#login-form #password').val() == '') {
            $('div#login-message').html('Please provide your credentials.');
            return ;
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
            url: 'http://localhost:3000/oauth2/access_token',
            data: params ,
            success: function(data, textStatus, jqXHR) {
              if (data['access_token']) {
                setCurrentUser(data);
                $('#login-dialog').dialog('close');
              }
            }
          });
        }
      }
      ]
    });

    $('input').blur();
    
  };
  
  obtainUserAuthorization();
  
  //('<div id="login-dialog"></div>').appendTo('body').dialog();
});
