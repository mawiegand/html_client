steal(
  'jquery/model',
  function() {

    $.Model('Htmlclient.Models.User',
    {
      
    },{
      userData: null,
     
    	authenticate: function(params, success, error) {
    	  
    	  var self = this;
    	  
    	  $.ajax({
          type: 'POST',
          url: config.identity_provider_base + '/oauth2/access_token',
          data: params,
          success: function(data, textStatus, jqXHR) {
            switch(jqXHR.status) {
              case 200:
                if (data.access_token) {
                  config.currentUser = data;
                  (success)();
                }
                break;
              default:
                msgObj = $.parseJSON(jqXHR.responseText);
                (error)(msgObj.error + ": " + msgObj.error_description);
            }
          },
          error: function(jqXHR, textStatus, errorThrown) {
            switch(jqXHR.status) {
              case 400:
              default:
                errObj = $.parseJSON(jqXHR.responseText);
                (error)(errObj.error + ": " + errObj.error_description);
            }                          
          }
        });
      },
      
    	fetchSelf: function() {	  
    	  
    	  var self = this;
  
    	  if (config.clientLosesAuthHeaderOnRedirect) {
          $.ajax.data = {access_token: config.currentUser.access_token};
        } 
      
    	  $.getJSON(config.identity_provider_base + '/identities/self')
        .success(function(data, textStatus, jqXHR) {
          self.attr('userData', data);
        })
        .error(function(jqXHR, textStatus, errorThrown) {
          console.log('error');
        });
    	},
    	
    });
  }
);