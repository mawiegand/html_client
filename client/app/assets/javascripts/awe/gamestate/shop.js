/* Author: Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};

AWE.GS = (function(module) {

  module.CURRENCY_CREDITS = 0;
  module.CURRENCY_GOLDEN_FROGS = 1;

  module.Shop = module.Entity.extend({
    resourceOffers: null,
    bonusOffers: null,
    specialOffer: null,
    platinumOffers: null,
    creditAmount: null,
    
    loading: true,
  })

  // singleton for in app shop.
  module.ShopManager = function(my) {
        
    var that = {};
    var lastUpdate;
    
    my = my || {};
    
    my.shop = null;
    
    that.init = function() {
      
      my.shop = module.Shop.create();
    };
    
    that.getShop = function(){
      return my.shop;
    };
    
    that.fetchCreditAmount = function(success, error) {
      $.getJSON(AWE.Config.SHOP_SERVER_BASE + 'accounts/' + AWE.GS.game.getPath('currentCharacter.id'), function(data) {
        my.shop.set('creditAmount', data.credit_amount);
        if (success) {
          success(data);
        }
      }).error(function() {
        if (error) {
          error(data);
        }
      });
    };
    
    that.buyResourceOffer = function(offerId, successCallback, errorCallback) {
      var offer = module.ResourceOfferManager.getResourceOffer(offerId);
      if (offer) {
        offer.set('isBuying', true);
      }
      var transaction = AWE.Action.Shop.createOfferTransaction(offerId, 'resource');
      transaction.send(function(status) {
        if (offer) {
          offer.set('isBuying', false);
        }
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

    that.buySpecialOffer = function(offerId, successCallback, errorCallback) {
      var offer = module.SpecialOfferManager.getSpecialOffer(offerId);
      if (offer) {
        offer.set('isBuying', true);
      }
      var transaction = AWE.Action.Shop.createOfferTransaction(offerId, 'special_offer');
      transaction.send(function(status) {
        if (offer) {
          offer.set('isBuying', false);
        }
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK
          AWE.GS.SpecialOfferManager.updateSpecialOffers();
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

    that.buyPlatinumOffer = function(offerId, successCallback, errorCallback) {
      var offer = module.PlatinumOfferManager.getPlatinumOffer(offerId);
      if (offer) {
        offer.set('isBuying', true);
      }
      var transaction = AWE.Action.Shop.createOfferTransaction(offerId, 'platinum');
      transaction.send(function(status) {
        if (offer) {
          offer.set('isBuying', false);
        }
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {    // 200 OK 
          AWE.GS.PlatinumOfferManager.updatePlatinumOffers();
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
      // $('<form style="display:none;" id="paymentstarter" action="' + AWE.Config.PAYMENT_PROVIDER_BASE + 'auth/sessions/" method="POST" target="_blank">' +
        // '  <input type="hidden" name="access_token" value="' + AWE.Net.currentUserCredentials.get('access_token') + '" />' +
        // '</form>').appendTo('body').submit().remove();
      //$('<form style="display:none;" id="paymentstarter" action="https://secure.bytro.com/index.php?eID=api&action=openPartnerShop&key=wackadooShop" method="POST" target="_blank">' +
      //  '  <input type="hidden" name="hash" value="' + AWE.Net.currentUserCredentials.get('access_token') + '" />' +
      //  '  <input type="hidden" name="data" value="' + AWE.Util.Base64.encode('hostname=' + escape(AWE.Config.SHOP_HOSTNAME)) + '" />' +
      //  '</form>').appendTo('body').submit().remove();
    }; 
        
    return that;
  }();
    
  return module;
    
}(AWE.GS || {}));



