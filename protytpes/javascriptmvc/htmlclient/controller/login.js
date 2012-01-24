steal(
	'jquery/controller',
	'jquery/view/ejs',
	'../models/user')
	.then( './views/init.ejs', function($) {

/**
 * @class Htmlclient.App
 */
$.Controller('Htmlclient.Login',
/** @Static */
{
},
/** @Prototype */
{
  currentUser: null,
	init: function() {
		
		this.element.append('controller/views/init.ejs', [null]);
      
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

    $('#send-button').click(function() {
      
      if ($('#login-form #username').val() == '' || $('#login-form #password').val() == '') {
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
      
      currentUser = new Htmlclient.Models.User();
      currentUser.authenticate(params, function(){
        $('#login-dialog').remove();
        $('#widget-overlay').remove();
        currentUser.fetchSelf();
      }, function(msg){
        $('#login-message').text(msg);
      });
      currentUser.bind('userData', function(ev) {
        if (currentUser.userData !== null) {
          $('#current_user-info').html("Signed-in as " + currentUser.userData.nickname + " / " +  currentUser.userData.email);
        }
      });

      return false; // prevent default behavior
	  });
	  
    $('#reload-button').click(function() {
      if (currentUser!== null) {
        currentUser.fetchSelf();
      }
    });
	
	  $('input').blur();      
	},
})

});