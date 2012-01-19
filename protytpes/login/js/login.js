$(document).ready(function() {
  
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
	      </fieldset>\
	      </form>\
      </div>');
      
    $('#input-password').hide();

      
    $('#login-dialog input.clear').each(function() {
      $(this)
        .keydown(function(event) {               // necessary to remove label immediately for the case, where the user holds the key
          if (!event.keyCode in { 13:true, 8:true, 9:true, 16: true }) {
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
          alert($('#login-form').serialize());
        }
      }
      ]
    });
  
    $('.ui-dialog .text').blur();
    
    
  };
  
  obtainUserAuthorization();
  
  //('<div id="login-dialog"></div>').appendTo('body').dialog();
});
