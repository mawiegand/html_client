/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.GS = (function(module) {
  
  module.Shop = module.Entity.extend({
    resourceOffers: null,
    bonusOffers: null,
    creditAmount: null,
  })

  // singleton for in app shop.
  module.ShopManager = function(my) {
        
    var that = {};
    var lastUpdate;
    
    my = my || {};
    
    my.shop = null;
    
    that.init = function() {
      
      my.shop = module.Shop.create({
        creditAmount: 0,
      });
      
      that.fetchResourceOffers();
      that.fetchCreditAmount();
      AWE.GS.BonusOfferManager.updateBonusOffers(null, function(result) {
        my.shop.set('bonusOffers', AWE.GS.BonusOfferManager.getBonusOffers());
      });
    };
    
    that.getShop = function(){
      return my.shop;
    };
    
    that.fetchResourceOffers = function(callback) {
      $.getJSON(AWE.Config.SHOP_SERVER_BASE + 'resource_offers', function(data) {
        my.shop.set('resourceOffers', data);
        
        if (callback) {
          callback(data);
        }
      });
    };
    
    that.fetchCreditAmount = function(callback) {
      $.getJSON(AWE.Config.SHOP_SERVER_BASE + 'account', function(data) {
        my.shop.set('creditAmount', data.credit_amount);
        
        if (callback) {
          callback(data);
        }
      }).error(function() {
        my.shop.set('creditAmount', 0);
      });
    };
    
    that.buyResourceOffer = function(offerId, successCallback, errorCallback) {
      var transaction = AWE.Action.Shop.createOfferTransaction(offerId, 'resource');
      transaction.send(function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK 
          AWE.GS.ResourcePoolManager.updateResourcePool(null, function(){
            log('AWE.GS.ResourcePoolManager.updateResourcePool completed')
          });
          if (successCallback) {
            successCallback(transaction.data());
          }
        }
        else {
          if (errorCallback) {
            errorCallback();
          }
        }
      });
    }
    
    that.buyBonusOffer = function(offerId, successCallback, errorCallback) {
      var offer = module.BonusOfferManager.getBonusOffer(offerId);
      if (offer) {
        offer.set('isBuying', true);
      }
      var transaction = AWE.Action.Shop.createOfferTransaction(offerId, 'bonus');
      transaction.send(function(status) {
        if (offer) {
          offer.set('isBuying', false);
        }
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK 
          AWE.GS.BonusOfferManager.updateBonusOffers();
          if (successCallback) {
            successCallback(transaction.data());
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
      $('<form id="paymentstarter" action="' + AWE.Config.PAYMENT_PROVIDER_BASE + 'auth/sessions/" method="POST" target="_blank">' +
        '  <input type="hidden" name="access_token" value="' + AWE.Net.currentUserCredentials.get('access_token') + '" />' +
        '</form>').submit();
    }; 
        
    return that;
  }();
    
  return module;
    
}(AWE.GS || {}));



