/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/shopview.html');
  
  module.ShopDialog = module.Dialog.extend({
    templateName: 'shop',
    
    init: function() {
      this._super();      
    },

    shop: null,

    resourceOffersBinding: 'shop.resourceOffers',
    bonusOffersBinding: 'shop.bonusOffers',

    creditAmountBinding: 'shop.creditAmount',

    buyCreditsPressed: function() {
      alert('Action not connected: buyCreditsWasPressed.');
    },
    
    buyResourceOfferPressed: function() {
      alert('Action not connected: buyOfferWasPressed.');
    },
    
    buyBonusOfferPressed: function() {
      alert('Action not connected: buyOfferWasPressed.');
    },
    closePressed: function() {
      alert('Action not connected: closedWasPressed.');
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
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




