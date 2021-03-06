
var AWE = window.AWE || {};

AWE.Facebook = (function(module) {
  
  var initializing = false;
  var initCallbacks = [];
  
  module.initialized  = false;
  module.defaultScope = {scope: AWE.Config.FB_SCOPES};
  module.status       = 'unkown';                // status of fbuser; 'unkonwn' -> not initialized, 'connected', etc.
  module.cachedAuthRepsonse = null;              // last auth-response received from facebook.
  module.isRunningInCanvas  = false;             // running inside of facebook
  module.isFbPlayer         = false;             // running inside or outside of facebook with user logged in via fb
  
  
  /** call this method to initialize facebook or make sure it's initialized. 
   * Can be called multiple times with different onSuccess handlers.
   * This method can be used as a wrapper around any other facebook task;
   * if fb is already initialized, it will immediately execute onSuccess,
   * otherwise, it will initialize fb and call onSuccess as soon as fb is
   * ready. 
   */
  module.init = function(onSuccess) {
    
    if (onSuccess) {
      if (module.initialized) {                  // execute callback immediately, if FB already initialized
        onSuccess();
      }
      else {
        initCallbacks.push(onSuccess);
      }
    }
    
    if (!module.initialized && !initializing) {
      initializing = true;
    }
    else {
      return ; // second call to init!
    }

    var sdkLocale = AWE.Settings.locale || AWE.Config.DEFAULT_LOCALE || "en_US";
    
    window.fbAsyncInit = function() {
      
      // init the FB JS SDK
      FB.init({
        appId      : AWE.Config.FB_APP_ID,          // App ID from the app dashboard
        channelUrl : '//'+AWE.Config.SERVER_ROOT+'client/channel.html', // Channel file for x-domain comms
        status     : true,                       // Check Facebook Login status
        xfbml      : false                       // Don't look for social plugins on the page
      });
      // Additional initialization code such as adding Event Listeners goes here
      
      FB.Event.subscribe('auth.authResponseChange', function(response) {
        module.status = response.status;
        module.cachedAuthResponse = response.authResponse;
        AWE.Log.Debug('FACEBOOK: authResponseChanged', response.status, response);
      });
    
      module.initialized = true;
      initializing = false;
    
      AWE.Ext.applyFunction(initCallbacks, function(callback) {
        if (callback) {
          callback();
        }
      });
    
      AWE.Log.Debug('FACEBOOK: initialized facebook sdk');
    };
    
    // Load the SDK asynchronously
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/"+sdkLocale+"/all.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  }
  
  module.updateFBCanvasSize = function() {
    if (module.isRunningInCanvas && module.initialized) {
      //FB.Canvas.setSize({width: 600, height: 320});
      FB.Canvas.setAutoGrow(false);
    }
  }
  
  module.setDoneLoading = function() {
    if (module.isRunningInCanvas && module.initialized) {
      FB.Canvas.setDoneLoading();
    }
  }

  module.buyFbOffer = function(offer, success, error) {};

  module.postUserStory = function(symbolicId, success, error) {

    var userStory = AWE.GS.RulesManager.getRules().getFacebookUserStoryWithSymbolicId(symbolicId);

    if (userStory) {
      var storyObject = {};
      storyObject[userStory.type] = userStory.url;
      FB.api('/me/wack-a-doo:' + userStory.action, 'post', storyObject, function(response) {
        if (!response || response.error) {
          if (error) {
            error(response.error);
          }
        } else {
          if (success) {
            success();
          }
        }
      });
    }
    else {
      if (error) {
        error('User Story not found ', symbolicId);
      }
    }
  };

  return module;

}(AWE.Facebook || {}));
