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
      
      // TODO add onfocus event to capture event when user comes back from bytro shop
    },

    shop: null,
    
    shopEnabledBinding: 'shop.enabled',
    
    loading: function() {
      return this.getPath('shop.loading') && this.get('creditAmount') == null;
    }.property('shop.loading', 'creditAmount').cacheable(),

    resourceOffersBinding: 'shop.resourceOffers',
    bonusOffersBinding: 'shop.bonusOffers',
    platinumOffersBinding: 'shop.platinumOffers',

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
  
  module.ShopPlatinumOffer = Ember.View.extend({
    templateName: 'shop-platinum-offer',
    
    offer: null,
    
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
    }.property('platinumExpiration'),    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




