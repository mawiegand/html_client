
var AWE = window.AWE || {};

AWE.Facebook = (function(module) {
  
  var initializing = false;
  var initCallbacks = [];
  
  module.initialized  = false;
  module.defaultScope = {scope: 'email'}; 
  module.status = 'unkown';
  
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
        appId      : '127037377498922',          // App ID from the app dashboard
        channelUrl : '//'+AWE.Config.SERVER_ROOT+'client/channel.html', // Channel file for x-domain comms
        status     : true,                       // Check Facebook Login status
        xfbml      : false                       // Don't look for social plugins on the page
      });
      // Additional initialization code such as adding Event Listeners goes here
      
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
       js.src = "//connect.facebook.net/'+sdkLocale+'/all.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  }
  

  module.connnectCharacter = function(character) {
    
    var fetchMeAndConnect = function(authResponse, repeat) {
      FB.api('/me', function(response) {    // check, it's really connected
        if (!response || response.error) {  
          if (repeat) {                     // in case status was cached,
            loginAndConnect();              // try again once more! -
          }
        }
        else {
          var fbPlayerId    = authResponse.userID;
          var fbAccessToken = authResponse.accessToken;

          AWE.Log.Debug('FACEBOOK: everything seems, fine, sending information to server. Me:', response)
          
          var action = AWE.Action.Fundamental.createConnectFacebookAction(fbPlayerId, fbAccessToken);
          AWE.Action.Manager.queueAction(action, function(status) {
            if (status === AWE.Net.CONFLICT) {
              AWE.Log.Debug('FACEBOOK: conflict, id already connected with someone else.')
            }
            else if (status === AWE.Net.OK) {
              AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, null);
            }
            else {
              AWE.Log.Debug('FACEBOOK: unkown error, could not connect.')
            }
          });
        }
      });
    }
    
    var loginAndConnect = function() {
      AWE.Log.Debug('FACEBOOK: now call login');
      FB.login(function(response) {
        AWE.Log.Debug('FACEBOOK: login response', response);
        if (response.authResponse) {
          fetchMeAndConnect(response.authResponse, false);
        }
        // do nothing, if user does not authorize the app
      }, module.defaultScope);
    }
    
    var considerStatusAndConnect = function() {
      if (module.status == 'connected') {
        fetchMeAndConnect();
      }
      else {
        loginAndConnect();
      } 
    }
    
    if (character.get('isConnectedToFacebook')) {
      AWE.Log.Debug('FACEBOOK: user is already connected with facebook');
      return ;
    }
    
    if (module.status == 'unkown') {
      AWE.Facebook.init(function() {
        considerStatusAndConnect();
      });
    }
    else {
      considerStatusAndConnect();
    }
  }
    
  return module;

}(AWE.Facebook || {}));
