/**
 * @fileOverview 
 * Ember JS views for the settlement screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {

  module.FacebookCreditOfferDialog = module.Dialog.extend({
    templateName: 'facebook-credit-offer-dialog',

    init: function() {
      //AWE.GS.FbCreditOfferManager.updateFbCreditOffers(null, function(result) {
      //  this.get
      //});
      this._super();
    },

    offers: function() {
      var shop = AWE.GS.ShopManager.getShop();
      var fbOffers = shop.get('fbCreditOffers');
      return fbOffers;
    }.property(),

    closePressed: function() {
      this.destroy();
      return false;
    },
  });

  module.FacebookCreditOfferView = Ember.View.extend({
    templateName: 'facebook-credit-offer-view',
    offer: null,

    buyOffer: function() {
      alert(this.getPath('offer.id'));
    },

    price: function() {
      // get error here since offer is undefined
      return this.getPath('offer.prices')[0];
    }.property('offer.prices'),
  });

  module.FacebookSubcribeView = Ember.View.extend({
    templateName: 'facebook-subscribe-view',
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

