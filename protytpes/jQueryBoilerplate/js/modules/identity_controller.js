/** 
 * Copyright (c) 2012 5D Lab
 * Authored by Sascha Lange, Patrick Fox 
 */
var APP = window.APP || (window.App = {});


APP.IdentityController = function () {
  
  return {
    fetchSelf: function() {
      $.getJSON(APP.config.identity_provider_base + '/identities/self')
        .success(function(data, textStatus, jqXHR) {
          $('#current_user-info').html("Signed-in as " + data['nickname'] + " / " + data['email']);
        })
        .error(function(jqXHR, textStatus, errorThrown) {
          // add something here
        });
    },
  };
}();