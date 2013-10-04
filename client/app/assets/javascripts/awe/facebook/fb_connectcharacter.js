
var AWE = window.AWE || {};

AWE.Facebook = (function(module) {
  
  var fetchMeAndConnect = function(authResponse, onSuccess, onFailure) {
    FB.api('/me', function(response) {    // check, it's really connected
      if (!response || response.error) {  
        if (onFailure) {
          onFailure(400);
        }
      }
      else {
        var fbPlayerId    = authResponse.userID;
        var fbAccessToken = authResponse.accessToken;

        AWE.Log.Debug('FACEBOOK: everything seems, fine, sending information to server. Me:', response)
        
        var action = AWE.Action.Fundamental.createConnectFacebookAction(fbPlayerId, fbAccessToken);
        AWE.Action.Manager.queueAction(action, function(status) {
          if (status === AWE.Net.OK) {
            AWE.GS.CharacterManager.updateCurrentCharacter(AWE.GS.ENTITY_UPDATE_TYPE_FULL, function() {
              if (onSuccess) {
                onSuccess();
              }
            });
          }
          else {
            AWE.Log.Debug('FACEBOOK: error, could not connect', status);
            if (onFailure) {
              onFailure(status)
            }
          }
        });
      }
    });
  }
  
  var loginAndConnect = function(onSuccess, onFailure) {
    AWE.Log.Debug('FACEBOOK: now call login');
    FB.login(function(response) {
      AWE.Log.Debug('FACEBOOK: login response', response);
      if (response.authResponse) {
        fetchMeAndConnect(response.authResponse, onSuccess, onFailure);
      }
      else {
        if (onFailure) {
          onFailure('loginBreak');
        }
      }
      // do nothing, if user does not authorize the app
    }, module.defaultScope);
  }
  
  var considerStatusAndConnect = function(onSuccess, onFailure) {
    if (module.status == 'connected') {
      fetchMeAndConnect(module.cachedAuthResponse, onSuccess, onFailure);
    }
    else {
      loginAndConnect(onSuccess, onFailure);
    } 
  }
  
  
  
  /** connects a facebook user to the currenctCharacter IFF
   * the character hasn't been connected, yet. */
  module.connnectCharacter = function(character, onSuccess, onFailure) {

    if (character.get('isConnectedToFacebook')) {
      AWE.Log.Debug('FACEBOOK: user is already connected with facebook');
      return ;
    }
    
    if (module.status == 'unkown') {
      AWE.Facebook.init(function() {
        considerStatusAndConnect(onSuccess, onFailure);
      });
    }
    else {
      considerStatusAndConnect(onSuccess, onFailure);
    }
  }
    
  return module;

}(AWE.Facebook || {}));
