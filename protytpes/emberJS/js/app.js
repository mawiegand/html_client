var LoginApp = Ember.Application.create();

LoginApp.Controllers = {};
LoginApp.Views = {};
LoginApp.Models = Ember.Object.create({});

LoginApp.Config = {
  identityProviderBase: 'https://localhost/identity_provider/',
  clientLosesAuthHeaderOnRedirect: false,            // standard setting
  autoDetectRedirectFlaws: true,                     // detect redirect flaws and set config appropriately
};

LoginApp.init = function () {

  var bindAJAXHelpers = function () {
        
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
      if (LoginApp.Models.accessToken && LoginApp.Models.accessToken['access_token']) {
        if (!LoginApp.Config.clientLosesAuthHeaderOnRedirect) {   // otherwise, the access token will be in the data section / query string
          var token = (LoginApp.Models.accessToken && LoginApp.Models.accessToken['access_token']) ?  LoginApp.Models.accessToken['access_token'] : "";
          xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
      }
      xhr.setRequestHeader('Accept', 'application/json');
    });
  
    $(document).ajaxError(function(event, xhr, settings, exception) {
      if (xhr.status == 401) {
        LoginApp.authorize();
      }
    });
  
  }  
  
  bindAJAXHelpers();
  
};

LoginApp.authorize = function() {
  LoginApp.Views.loginFormView.append();
}

LoginApp.Models.accessToken = null;

LoginApp.Models.identity = Ember.Object.create({
  nickname: null,
  firstname: null,
  surname: null,
  email: null,
});


LoginApp.Views.loginFormView = Ember.View.create({
  templateName: 'login-form',
  title: 'Please Sign-in',
  loginMessage: '',
});

LoginApp.Views.CurrentIdentityView = Ember.View.extend({
  
  nicknameBinding: 'LoginApp.Models.identity.nickname',
  emailBinding: 'LoginApp.Models.identity.email',  
});


LoginApp.Controllers.identityController = Ember.Object.create({
  accessTokenChanged: function() {
     if (LoginApp.Config.clientLosesAuthHeaderOnRedirect) { // auto-append access-token to query string / post data
      $.ajax.data = { access_token: LoginApp.Models.accessToken['access_token'] };
    }    
    this.fetchSelf();
  },
  fetchSelf: function() {
    $.getJSON(LoginApp.Config.identityProviderBase + '/identities/self')
      .success(function(data, textStatus, jqXHR) {
        LoginApp.Models.identity.set('firstname', data['firstname']);
        LoginApp.Models.identity.set('surname', data['surname']);
        LoginApp.Models.identity.set('nickname', data['nickname']);
        LoginApp.Models.identity.set('email', data['email']);
      })
      .error(function(jqXHR, textStatus, errorThrown) {
          // add something here
      });
  }
});

// Make identityController observe changes of the access token
LoginApp.Models.addObserver('accessToken', function() {
  LoginApp.Controllers.identityController.accessTokenChanged();
});

LoginApp.Controllers.loginController = Ember.Object.create({
  content: Ember.Object.create({
    username: null,
    password: null,
    loginMessage: null,
  }),
  submitLogin: function() {
    if (!this.content.username || !this.content.password ||
        this.content.username == "" || this.content.password == "") {
      LoginApp.Views.loginFormView.set('loginMessage', 'Please enter your email or nickname and password.');
      return false;
    }
    LoginApp.Views.loginFormView.set('loginMessage', '');
    
    var params = [
      { name: 'username',
        value: this.content.username },
      { name: 'password',
        value: this.content.password },
      { name: 'client_id',
        value: 'XYZ' },
      { name: 'scope',
        value: '5dentity wackadoo' },
      { name: 'grant_type',
        value: 'password' }
    ];
    
    var that = this;

    $.ajax({
      type: 'POST',
      url: LoginApp.Config.identityProviderBase + '/oauth2/access_token',
      data: params,
      success: function(data, textStatus, jqXHR) {
        switch(jqXHR.status) {
          case 200:
          if (data['access_token']) {
            LoginApp.Models.set('accessToken', data);
            LoginApp.Views.loginFormView.remove();
          }
          break;
          default:
          msgObj = $.parseJSON(jqXHR.responseText);
          LoginApp.Views.loginFormView.set('loginMessage', msgObj.error + ": " + msgObj.error_description);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        switch(jqXHR.status) {
          case 400:
          default:
          errObj = $.parseJSON(jqXHR.responseText);
          LoginApp.Views.loginFormView.set('loginMessage', errObj.error + ": " + errObj.error_description);
        }                          
      }
    });
  }
});



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
$.getJSON(LoginApp.Config.identityProviderBase + '/oauth2/redirect_test_start')
  .success(function(data, textStatus, jqXHR) {
    $(document).unbind('ajaxSend');
    if (!data.ok) {
      if (!data.authorization_header || 
          data.authorization_header != 'Bearer test_token') {
        LoginApp.Config.clientLosesAuthHeaderOnRedirect = true ;
      }
      if (!data.accept_header || data.accept_header != 'application/json') {
        alert('Lost accept header. The client really needs to handle this,'+
              ' otherwise the server might send HTML!!!');
        exit(1);
      }        
    }
    LoginApp.init();
    LoginApp.authorize();
  })
  .error(function(jqXHR, textStatus, errorThrown) {
    alert('Server error. Could not connect.');
  });
   
/**************************************************************************/ 










