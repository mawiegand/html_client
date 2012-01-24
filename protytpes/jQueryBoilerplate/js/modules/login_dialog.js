/** 
 * Copyright (c) 2012 5D Lab
 * Authored by Sascha Lange, Patrick Fox 
 */
var APP = window.APP || (window.App = {});


APP.LoginForm = function () {   // use closure to hide private vars
  
  var _initialized = false;
  var _html = 
    '<div id="login-dialog"> \
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
    </div>';
    
  var _init = function(anchor) {
    _initialized = true;
    
    $(anchor).append(_html);    
      
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
      APP.LoginForm.send();          // TODO: this seems wrong. somehow connect from "the outside".
      return false; // prevent default behaviour
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
          APP.LoginForm.send();
        }
      }
      ]
    });
  };
    
  return {
    controller: null,
    show: function(anchor) {
      anchor = anchor || 'body';
      if (!_initialized) {
        _init(anchor);
        $('#login-dialog').dialog('open');
        $('input').blur();    
      }  
      else { // don't blur
        $('#login-dialog').dialog('open');
        if ($('input#username').val() == '') {
          $('input#username').focus(); // focus at username, if it hasn't been entered, yet
        }
        else {
          $('input#password').focus(); // focus at password, as we've resetted this value
        }
      }
    },
    hide: function() {
      $('input#password')             // reset password to prevent unauthorized access
        .val('')    
        .siblings('label').show();  
      $('#login-dialog').dialog('close');
    },
    send: function() {
      var username = $('#login-form #username').val();
      var password = $('#login-form #password').val()
      if (username == '' || password == '') {
        this.setMessage('Please provide your credentials.');
      }
      else {
        if (this.controller) {
          this.controller.enteredCredentials(username, password);
        }
      }
    },
    setMessage: function(msg) {
      $('div#login-message').html(msg);
    },
  }
}();
  



