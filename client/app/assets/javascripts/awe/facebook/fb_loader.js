
var AWE = window.AWE || {};

AWE.Facebook = (function(module) {
  
  var initializing = false;
  
  module.initialized = false;
  
  module.init = function() {
    
    if (!module.initialized && !initializing) {
      initializing = true;
    }
    else {
      return ; // second call to init!
    }
    
    window.fbAsyncInit = function() {
      // init the FB JS SDK
      FB.init({
        appId      : '127037377498922',                    // App ID from the app dashboard
        channelUrl : '//'+AWE.Config.SERVER_ROOT+'client/channel.html', // Channel file for x-domain comms
        status     : true,                                 // Check Facebook Login status
      //xfbml      : true                                  // Look for social plugins on the page
      });
      // Additional initialization code such as adding Event Listeners goes here
      
      module.initialized = true;
      initializing = false;
      
      AWE.Log.Debug('FACEBOOK: initialized facebook sdk');
    };

    // Load the SDK asynchronously
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/all.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  }
  
  return module;

}(AWE.Facebook || {}));
