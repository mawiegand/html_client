/**
 * @fileOverview 
 * Ember.JS views for displaying details about player to player trading.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {}; 

AWE.UI.Ember = (function(module) {
  
  
  /** @class
   * @name AWE.UI.Ember.DiplomacyView */  
  module.PlayerToPlayerTradeView = Ember.View.extend( /** @lends AWE.UI.Ember.DiplomacyView# */ {
    templateName: "player-to-player-trade-view",
    
    resources:     null,
    recipientName: null,
    
    errorMessage:  null,
    sending:       false,
    
    init: function(args) {
      var resourceTypes = AWE.GS.RulesManager.getRules().resource_types;
      
      resources = [];
      resourceTypes.forEach(function(item) {
        if (item.tradable) {
          resources.push({
            type:   item,
            amount: null,
          });
        }
      });
      
      this.set('resources', resources);
      this._super(args);
    },
    
    totalAmount: function() {
      var resources = this.get('resources') || [];
      var total = 0;
      resources.forEach(function(item) {
        total += parseInt(item.amount || "0");
      });
      return total;
    }.property('resources.@each.amount').cacheable(),
    
    numCarts: function() {
      var total = this.get('totalAmount') || 0;
      return Math.ceil(Math.abs(total) / 10.0);
    }.property('totalAmount').cacheable(),
    
    inactive: function() {
      var total = this.get('totalAmount') || 0;
      var name = this.get('recipientName') || null;
      return name === null || total < 1;
    }.property('totalAmount', 'recipientName').cacheable(),
    
    impossible: function() {
      var carts = this.get('numCarts') || 0;
      var availableCarts = this.getPath('settlement.trading_carts') || 0;
      var inactive = this.get('inactive');
      console.log('SETTLEMENT', this.get('settlement'), this.getPath('settlement.trading_carts'))
      return !inactive && carts > availableCarts;
    }.property('settlement.trading_carts', 'numCarts').cacheable(),
    
    sendPressed: function() {
      if (this.get('inactive') || this.get('impossible')) {
        return false;   // minimal necessary conditions (entered a name, enough carts) not met 
      }
      var resources     = this.get('resources') || [];
      var recipientName = this.get('recipientName') || "";
      var settlementId  = this.getPath('settlement.id');
      var self          = this;
      
      this.set('sending', true);
      this.set('errorMessage', null);
      
      var action = AWE.Action.Trading.createSendTradingCartsAction(settlementId, recipientName, resources);
      action.send(function(status) {
        self.set('sending', false);
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {
        }
        else {
          self.set('errorMessage', 'The server did not accept the command.');
        }
      });
      
      return false;     // prevent default behavior
    },
  });  
  
  
  return module;
    
}(AWE.UI.Ember || {}));




