
var AWE = window.AWE || {};

AWE.Facebook = (function(module) {
  
  var fetchMeAndConnect = function(authResponse) {
    FB.api('/me', function(response) {    // check, it's really connected
      if (!response || response.error) {  
        // call onFailure handler
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
      fetchMeAndConnect(module.cachedAuthResponse);
    }
    else {
      loginAndConnect();
    } 
  }
  
  
  
  /** connects a facebook user to the currenctCharacter IFF
   * the character hasn't been connected, yet. */
  module.connnectCharacter = function(character) {

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
