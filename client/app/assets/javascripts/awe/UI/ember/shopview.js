/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.ShopDialog = module.Dialog.extend({
    templateName: 'shop',
    
    init: function() {
      this._super();

      var shop = AWE.GS.ShopManager.getShop();

      AWE.GS.ShopManager.fetchCreditAmount(function() {
        shop.set('loading', false);
        shop.set('enabled', true);
      },function() {
        shop.set('loading', false);
        shop.set('enabled', false);
      });
      AWE.GS.BonusOfferManager.updateBonusOffers(null, function(result) {
        shop.set('bonusOffers', AWE.GS.BonusOfferManager.getBonusOffers());
      });
      AWE.GS.ResourceOfferManager.updateResourceOffers(null, function(result) {
        shop.set('resourceOffers', AWE.GS.ResourceOfferManager.getResourceOffers());
      });
      AWE.GS.PlatinumOfferManager.updatePlatinumOffers(null, function(result) {
        shop.set('platinumOffers', AWE.GS.PlatinumOfferManager.getPlatinumOffers());
      });
      AWE.GS.SpecialOfferManager.updateSpecialOffers(null, function(result) {
        shop.set('specialOffer', AWE.GS.SpecialOfferManager.getSpecialOffers()[0]);
      });
    },

    shop: null,
    
    shopEnabledBinding: 'shop.enabled',
    
    loading: function() {
      return this.getPath('shop.loading') && this.get('creditAmount') == null;
    }.property('shop.loading', 'creditAmount').cacheable(),

    resourceOffersBinding: 'shop.resourceOffers',
    bonusOffersBinding: 'shop.bonusOffers',
    platinumOffersBinding: 'shop.platinumOffers',
    specialOfferBinding: 'shop.specialOffer',

    creditAmountBinding: 'shop.creditAmount',

    buyCreditsPressed: function() {
      log('Action not connected: buyCreditsWasPressed.');
    },
    
    buyResourceOfferPressed: function() {
      log('Action not connected: buyOfferWasPressed.');
    },
    
    buyBonusOfferPressed: function() {
      log('Action not connected: buyOfferWasPressed.');
    },

    buyPlatinumOfferPressed: function() {
      log('Action not connected: buyOfferWasPressed.');
    },

    buySpecialOfferPressed: function() {
      log('Action not connected: buyOfferWasPressed.');
    },

    specialOfferHelpPressed: function() {
      window.open(AWE.Config.APP_SUPPORT_BASE + '/info/special_offer', '_blank');
    },

    platinumHelpPressed: function() {
      window.open(AWE.Config.SHOP_SERVER_BASE + 'info', '_blank');
    },
    
    resourceExchangePressed: function() {
      var dialog = AWE.UI.Ember.ResourceExchangeDialog.create();
      WACKADOO.presentModalDialog(dialog);
      return false;
    },
    
    closePressed: function() {
      log('Action not connected: closedWasPressed.');
    },
  });
  
  module.ShopResourceOffer = Ember.View.extend({
    templateName: 'shop-resource-offer',
    
    offer: null,
    
    resourceName: function(){
      return AWE.Util.Rules.lookupTranslation(AWE.GS.RulesManager.getRules().getResourceType(this.getPath('offer.resource_id')).name);
    }.property('offer').cacheable(),
    
    buyResourceOfferPressed: function() {
      this.get('parentView').buyResourceOfferPressed(this.getPath('offer.id'));
    },
  });
  
  module.ShopBonusOffer = Ember.View.extend({
    templateName: 'shop-bonus-offer',
    
    offer: null,
    
    resourceName: function(){
      return AWE.Util.Rules.lookupTranslation(AWE.GS.RulesManager.getRules().getResourceType(this.getPath('offer.resource_id')).name);
    }.property('offer').cacheable(),
    
    buyBonusOfferPressed: function() {
      this.get('parentView').buyBonusOfferPressed(this.getPath('offer.id'));
    },
    
    classNameBindings: ['active'],
    
    active: function() {
      return this.get('offer').resource_effect !== null;
    }.property('offer.resource_effect'),    
  });

  module.ShopSpecialOffer = Ember.View.extend({
    templateName: 'shop-special-offer',

    offer: null,

    buySpecialOfferPressed: function() {
      this.get('parentView').buySpecialOfferPressed(this.getPath('offer.id'));
    },
  });

  module.ShopPlatinumOffer = Ember.View.extend({
    templateName: 'shop-platinum-offer',
    
    offer: null,

    lifetime: function() {
      return this.get('active') && AWE.GS.game.getPath('currentCharacter.platinum_lifetime');
    }.property('AWE.GS.game.currentCharacter.premium_expiration', 'AWE.GS.game.currentCharacter.platinum_lifetime').cacheable(),
    
    platinumExpiration: function() {
      var expiration = Date.parseISODate(AWE.GS.game.getPath('currentCharacter.premium_expiration'));
      if (expiration && expiration > new Date()) {
        return AWE.GS.game.getPath('currentCharacter.premium_expiration');
      }
      return null;
    }.property('AWE.GS.game.currentCharacter.premium_expiration').cacheable(),
    
    buyPlatinumOfferPressed: function() {
      this.get('parentView').buyPlatinumOfferPressed(this.getPath('offer.id'));
    },
    
    offerDurationDays: function() {
      return this.getPath('offer.duration') / 24;
    }.property('offer').cacheable(),
    
    classNameBindings: ['active'],
    
    active: function() {
      return this.get('platinumExpiration') !== null;
    }.property('AWE.GS.game.currentCharacter.premium_expiration'),
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




