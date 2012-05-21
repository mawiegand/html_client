/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.Shop = (function(module) {
          
  // singleton for in app shop.
  module.Manager = function(my) {
        
    var that = {};
    
    that.content = Ember.Object.create({
      shopOffers: null,
      creditAmount: 0,
    });
    
    that.init = function() {
      that.fetchOffers();
      that.fetchCreditAmount();
    };
    
    that.fetchOffers = function() {
      $.getJSON(AWE.Config.SHOP_SERVER_BASE + 'offers', function(data, b, c){
        that.content.set('shopOffers', data);
      });
    };
    
    that.fetchCreditAmount = function(callback) {
      $.getJSON(AWE.Config.PAYMENT_PROVIDER_BASE + 'customers/' + AWE.GS.CharacterManager.getCurrentCharacter().get('identifier') + '/account', function(data, b, c){
        that.content.set('creditAmount', data.amount);
        
        if (callback) {
          callback(data);
        }
      }).error(function() {
        that.content.set('creditAmount', 0);
      });
    };
    
    that.buyOffer = function(successCallback, errorCallback) {
      var frogTransaction = AWE.Shop.FrogTransaction.createFrogTransaction(1);
      frogTransaction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK 
          AWE.GS.CharacterManager.updateCharacter(AWE.GS.CharacterManager.getCurrentCharacter().getId(), AWE.GS.ENTITY_UPDATE_TYPE_SHORT, function() {
            log('AWE.GS.CharacterManager.updateCharacter completed')
          });
          
          if (successCallback) {
            successCallback(frogTransaction.data());
          }
        }
        else {
          if (errorCallback) {
            errorCallback();
          }
        }
      });
    }
    
    that.openCreditShopWindow = function() {
      $('#paymenthelper').html(
        '<form id="paymentstarter" action="' + AWE.Config.PAYMENT_PROVIDER_BASE + 'auth/sessions/" method="POST" target="_blank">' +
        '  <input type="hidden" name="access_token" value="' + AWE.Net.currentUserCredentials.get('access_token') + '" />' +
        '</form>'      
      );
      $('#paymentstarter').submit();
      $('#paymenthelper').html('');
    }; 
        
    return that;
  }();
    
  return module;
    
}(AWE.Shop || {}));



