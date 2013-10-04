
var AWE = window.AWE || {};

AWE.Facebook = (function(module) {
  
  var initializing = false;
  var initCallbacks = [];
  
  module.initialized  = false;
  module.defaultScope = {scope: 'email'}; 
  module.status       = 'unkown';                // status of fbuser; 'unkonwn' -> not initialized, 'connected', etc.
  module.cachedAuthRepsonse = null;              // last auth-response received from facebook.
  
  
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
        appId      : '127037377498922',          // App ID from the app dashboard
        channelUrl : '//'+AWE.Config.SERVER_ROOT+'client/channel.html', // Channel file for x-domain comms
        status     : true,                       // Check Facebook Login status
        xfbml      : false                       // Don't look for social plugins on the page
      });
      // Additional initialization code such as adding Event Listeners goes here
      
      FB.Event.subscribe('auth.authResponseChange', function(response) {
        module.status = response.status;
        module.cachedAuthResponse = response;
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
       js.src = "//connect.facebook.net/'+sdkLocale+'/all.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  }

  module.buyFbOffer = function(offerId, success, error) {

    var verifyOrderHandler = function(data) {
      if (data.status == "completed") {
        var fbVerifyOrderAction = AWE.Action.Shop.createFbVerifyOrderAction(offerId, data.payment_id, data.signed_request);
        fbVerifyOrderAction.send(function (status) {
          if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
            if (success) {
              success();
            }
          }
          else {
            if (error) {
              error(status);
            }
          }
        });
      }
      else
        if (error) {
          error(data.status);
        }
      }
    };


    FB.ui({
        method:  'pay',
        action:  'purchaseitem',
        product: 'https://test1.wack-a-doo.de/game_server/shop/fb_credit_offers/1',
      },
      verifyOrderHandler
    );
  }

  return module;

}(AWE.Facebook || {}));
