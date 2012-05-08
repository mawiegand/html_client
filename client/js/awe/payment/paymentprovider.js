/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.PaymentProvider = (function(that) {
          
  var _scope = null;
  
  that.init = function(scope) {
    _scope = scope;
  };
  
  that.fetchShopOffers = function(callback) {
    $.getJSON(AWE.Config.PAYMENT_PROVIDER_BASE + 'shop_offers', function(a, b, c){
      log('callback', a, b, c);
      callback(a);
    });
  };
      
  return that;
    
}(AWE.PaymentProvider || {}));



