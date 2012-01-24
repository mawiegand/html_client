/** 
 * Copyright (c) 2012 5D Lab
 * Authored by Sascha Lange, Patrick Fox 
 */
var APP = window.APP || (window.App = {});


APP.LoginController = function () {
  
  var _view;   
  
  return {
    setView: function(view) {
      _view = view;
    },
    enteredCredentials: function(username, password) {  

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
              
              AJAX_WRAPPER.setBearerToken(data['access_token']);  // TODO: ugly
              APP.IdentityController.fetchSelf();                 // TODO: ugly (use observer or binding)
              
              _view.hide();
            }
            break;
            default:
            msgObj = $.parseJSON(jqXHR.responseText);
            _view.setMessage(msgObj.error + ": " + msgObj.error_description);
          }
        },
        error: function(jqXHR, textStatus, errorThrown) {
          switch(jqXHR.status) {
            case 400:
            default:
            errObj = $.parseJSON(jqXHR.responseText);
            _view.setMessage(errObj.error + ": " + errObj.error_description);
          }                          
        }
      });
      return false; // prevent default behavior
    },
  };
}(); 