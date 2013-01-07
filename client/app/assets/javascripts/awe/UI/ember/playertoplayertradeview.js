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
   * @name AWE.UI.Ember.TradingCartActionView */  
  module.TradingCartActionView = Ember.View.extend( /** @lends AWE.UI.Ember.TradingCartActionView# */ {
    templateName: "trading-cart-action-view",

    tradingCartAction: null,
    settlement: null,
    
    startingSettlement: null,
    targetSettlement: null,
    
    recipient: null,
    sender: null,
    
    sending: false,
    
    cancelPressed: function() {
      var self = this;
      this.set('sending', true);
      this.getPath('parentView.controller').cancelTradingCartAction(this.getPath('tradingCartAction.id'), function(status) {
        self.set('sending', false);
      });  
      return false; // don't execute default action
    },
    
    outgoing: function() {
      return this.getPath('settlement.id') === (this.getPath('tradingCartAction.starting_settlement_id') || -1);
    }.property('settlement.id', 'tradingCartAction.starting_settlement_id'),
    
    cancelable: function() {
      return !this.getPath('tradingCartAction.returning') && this.get('outgoing');
    }.property('tradingCartAction.returning', 'outgoing'),
    
    load: function() {
      var rules = AWE.GS.RulesManager.getRules();
      var resourceTypes = rules.get('resource_types') || [];
      var action = this.get('tradingCartAction');
      var load = [];
      
      if (action === undefined || action === null) {
        return null;
      }
      
      resourceTypes.forEach(function(resource) {
        var field  = resource.symbolic_id + '_amount';
        var amount = action.get(field);
        if (amount && amount > 0) {
          load.push({
            resourceType: resource,
            amount:       amount,
          });
        }
      });
      return load;
    }.property('tradingCartAction.updated_at').cacheable(),
    
    empty: function() {
      return (this.get('load') || []).length == 0;
    }.property('laod').cacheable(),
    
    /** automatically fetch and set sender to sending character. */
    updateSender: function() {
      var self = this;
      var senderId = this.getPath('tradingCartAction.sender_id');
      var sender = senderId ? (AWE.GS.CharacterManager.getCharacter(senderId) || null) : null;
      this.set('sender', sender); 
      if (!sender) {
        AWE.GS.CharacterManager.updateCharacter(senderId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          if (character) {
            self.set('sender', character);
          }
        });
      }
    }.observes('tradingCartAction.sender_id'),
    
    /** automatically fetch and set recipient to receiving character. */
    updateRecipient: function() {
      var self = this;
      var recipientId = this.getPath('tradingCartAction.recipient_id');
      var recipient = recipientId ? (AWE.GS.CharacterManager.getCharacter(recipientId) || null) : null;
      this.set('recipient', recipient); 
      if (!recipient) {
        AWE.GS.CharacterManager.updateCharacter(recipientId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          if (character) {
            self.set('recipient', character);
          }
        });
      }
    }.observes('tradingCartAction.recipient_id'),
    
    /** automatically fetch and set starting settlement. */
    updateStartingSettlement: function() {
      var self = this;
      var settlementId = this.getPath('tradingCartAction.starting_settlement_id');
      var settlement = settlementId ? (AWE.GS.SettlementManager.getSettlement(settlementId) || null) : null;
      this.set('startingSettlement', settlement); 
      if (!settlement) {
        AWE.GS.SettlementManager.updateSettlement(settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
          if (settlement) {
            self.set('startingSettlement', settlement);
          }
        });
      }
    }.observes('tradingCartAction.starting_settlement_id'),    
    
    /** automatically fetch and set starting settlement. */
    updateTargetSettlement: function() {
      var self = this;
      var settlementId = this.getPath('tradingCartAction.target_settlement_id');
      var settlement = settlementId ? (AWE.GS.SettlementManager.getSettlement(settlementId) || null) : null;
      this.set('targetSettlement', settlement); 
      if (!settlement) {
        AWE.GS.SettlementManager.updateSettlement(settlementId, AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
          if (settlement) {
            self.set('targetSettlement', settlement);
          }
        });
      }
    }.observes('tradingCartAction.target_settlement_id'),       
    
  });  
  
  
  /** @class
   * @name AWE.UI.Ember.PlayerToPlayerTradeView */  
  module.PlayerToPlayerTradeView = Ember.View.extend( /** @lends AWE.UI.Ember.PlayerToPlayerTradeView# */ {
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
        var amount = parseInt(item.amount || "0");
        total += Math.max(amount, 0);
      });
      return total;
    }.property('resources.@each.amount').cacheable(),
    
    valid: function() {
      var resources = this.get('resources') || [];
      var valid = true;
      resources.forEach(function(item) {
        var amount = parseInt(item.amount || "0");
        valid = valid && amount >= 0; // TODO: check with maximum available
      });
      return valid;      
    }.property('resources.@each.amount').cacheable(),
    
    numCarts: function() {
      var total = this.get('totalAmount') || 0;
      return Math.ceil(Math.abs(total) / 10.0);
    }.property('totalAmount').cacheable(),
    
    inactive: function() {
      var total      = this.get('totalAmount') || 0;
      var name       = this.get('recipientName') || null;
      var valid      = this.get('valid') || false;
      var impossible = this.get('impossible') || false;
      return name === null || total < 1 || !valid || impossible;
    }.property('totalAmount', 'recipientName', 'valid', 'impossible').cacheable(),
    
    impossible: function() {
      var carts = this.get('numCarts') || 0;
      var availableCarts = this.getPath('settlement.availableTradingCarts') || 0;
      return carts > availableCarts;
    }.property('settlement.availableTradingCarts', 'numCarts').cacheable(),
    
    sanitizedInput: function() {
      var resources = this.get('resources') || [];
      var cleaned   = [];
      resources.forEach(function(item) {
        var amount = parseInt(item.amount || "0");  // make integer
        amount = Math.max(amount, 0);               // min 0
        cleaned.push({
          type: item.type,
          amount: amount,
        })
      }); 
      return cleaned;   
    },
        
    sendPressed: function() {
      
      if (this.get('inactive')) {
        return false;   // minimal necessary conditions (entered a name, enough carts) not met 
      }
      var resources     = this.sanitizedInput();
      var recipientName = this.get('recipientName') || "";
      var settlementId  = this.getPath('settlement.id');
      var self          = this;

      var ownName       = AWE.GS.game.getPath('currentCharacter.name') || "";
      
      if (recipientName === ownName) {
        this.set('errorMessage', AWE.I18n.lookupTranslation('settlement.trade.error.recipientUnknown'));
        return false;
      }
      
      this.set('sending', true);
      this.set('errorMessage', null);
      
      this.get('controller').sendTradingCarts(settlementId, recipientName, resources, function(status) {
        if (status === AWE.Net.OK || status === AWE.Net.CREATED) {
        }
        else if (status === AWE.Net.NOT_FOUND) {
          self.set('errorMessage', AWE.I18n.lookupTranslation('settlement.trade.error.recipientSelf'));          
        }
        else {
          self.set('errorMessage', AWE.I18n.lookupTranslation('error.genericServer'));
        }
        self.set('sending', false);
      });   
      return false;     // prevent default behavior
    },
    
  });  

  
  return module;
    
}(AWE.UI.Ember || {}));




