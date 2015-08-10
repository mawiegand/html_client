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
    hurrying: false,

    speedupCosts: function() {
      return AWE.GS.RulesManager.getRules().trading_speedup.amount;
    }.property().cacheable(),
    
    speedupTooltipText: function() {
      if ((this.getPath('tradingCartAction.send_hurried') && !this.getPath('tradingCartAction.returning')) || (this.getPath('tradingCartAction.return_hurried') && this.getPath('tradingCartAction.returning')))
        return AWE.I18n.lookupTranslation('settlement.trade.hurryTooltipHurried');
      else
        return AWE.I18n.lookupTranslation('settlement.trade.hurryTooltip');
    }.property('tradingCartAction.send_hurried', 'tradingCartAction.return_hurried', 'tradingCartAction.returning'),
    
    cancelPressed: function() {
      var self = this;
      this.set('sending', true);
      this.getPath('parentView.controller').cancelTradingCartAction(this.getPath('tradingCartAction.id'), function(status) {
        self.set('sending', false);
      });  
      return false; // don't execute default action
    },
    
    speedupPressed: function() {
      var self = this;
      this.set('hurrying', true);
      this.getPath('parentView.controller').speedupTradingCartAction(this.getPath('tradingCartAction.id'), function(status) {
        
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
    
    updateHurryButton: function() {
      var self = this;
      var returned_at = this.getPath('tradingCartAction.returned_at');
      var returned = Date.parseISODate(returned_at);
      var now = AWE.GS.TimeManager.estimatedServerTime(); // now on server
      
      if(now.getTime() < returned.getTime())
        self.set('hurrying', false);
    }.observes('tradingCartAction.updated_at'),
    
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
            amount: 0,
          });
        }
      });

      this.set('resources', resources);
      this._super(args);
    },

    currentID: null,

    setupResourceValues: function(){
      var currentResourcesNum = this.get('maxAmount') - this.get('totalAmount');
      var isOverfill = (currentResourcesNum < 0);
      var self = this;
      if(isOverfill)
      {
        /*var toBeChanged =[];
        var sum = 0;
        self.get('resources').forEach(function(resource) {
          if(resource.type.id != self.get('currentID'))
          {
            toBeChanged.push(resource.amount);
            sum+= parseInt(resource.amount);
          }
        });

        mustAmount = Math.floor((sum + currentResourcesNum)/2);*/
        resources = [];
        var i = 0;
        self.get('resources').forEach(function(resource) {

         /* if(resource.type.id != self.get('currentID'))
          {
            resource.amount = mustAmount;
            self.setPath('resources.'+i+'.amount', mustAmount);
          }*/
          if(resource.type.id == self.get('currentID'))
          {
             self.setPath('resources.'+i+'.amount', (parseInt(resource.amount) + currentResourcesNum));
          }
          i+=1;
        });
      }
      return true;
    }.observes('resources.@each.amount'),

    /*changeCallbackFromSlider: function(){
      this.get('setupResourceValues');
    }.observes('resources.@each.amount'),*/

    maxAmount: function() {
      var aviableTradingCards = this.getPath('settlement.availableTradingCarts');
      return Math.ceil(Math.abs(aviableTradingCards) * 10.0)
    }.property('settlement.availableTradingCarts').cacheable(),
    
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
          self.set('recipientName', '');
          var i = 0;
          self.get('resources').forEach(function(resource) {

              self.setPath('resources.'+i+'.amount', 0);
              i+=1;
          });

        }
        else if (status === AWE.Net.NOT_FOUND) {
          //self.set('errorMessage', AWE.I18n.lookupTranslation('settlement.trade.error.recipientSelf'));          
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('settlement.trade.error.recipientSelf'),
            message: AWE.I18n.lookupTranslation('settlement.trade.error.recipientSelf'),
          });
          WACKADOO.presentModalDialog(errorDialog);
        }
        else {
          //self.set('errorMessage', AWE.I18n.lookupTranslation('error.genericServer'));
          var errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('resource.exchange.errors.noinput.heading'),
            message: AWE.I18n.lookupTranslation('error.genericServer'),
          });
          WACKADOO.presentModalDialog(errorDialog);
        }
        self.set('sending', false);
      });   
      return false;     // prevent default behavior
    },
    
  });

  module.FrogTradeView = Ember.View.extend({
    templateName: "frog-trade-view",

    resourceExchangePressed: function() {
      var dialog = AWE.UI.Ember.ResourceExchangeDialog.create();
      WACKADOO.presentModalDialog(dialog);
      return false;
    },
  });


  //NEW DIALOGS START
//Added resourceexchangedialog, was not found from other file
module.ResourceExchangeDialog = Ember.View.extend({//module.Dialog.extend({
    templateName: 'resource-exchange-dialog',
    loadingInit: null,    /* init loading */
    loadingSend: null,    /* exchange loading */

    /* resource pool */
    pool: null,

    /* new selected min values */
    newStoneValue: null,
    newWoodValue: null,
    newFurValue: null,

    /* remaining resources */
    remaining: null,

    /* sum of resources */
    sum: null,

    init: function() {
      this._super();
      this.set('loadingInit', true);
      var self = this;

      /* jump to top */
     // $('html, body').animate({ scrollTop: 0 }, 'slow');

      AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
        self.set('loadingInit', false);
        self.set('pool', AWE.GS.ResourcePoolManager.getResourcePool());
        self.set('newStoneValue', 0);
        self.set('newWoodValue', 0);
        self.set('newFurValue', 0);
      });
    },

    cost: function() {
      return AWE.GS.RulesManager.getRules().resource_exchange.amount;
    }.property().cacheable(),

    /* properties */
    getSum: function() {
      this.set('sum', this.getPath('pool.resource_stone_present') + this.getPath('pool.resource_wood_present') + this.getPath('pool.resource_fur_present'));
      return this.get('sum');
    }.property('pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present').cacheable(),

    getNewSum: function() {
      this.set('newSum', (parseInt(this.get('newStoneValue')) || 0) + (parseInt(this.get('newWoodValue')) || 0) + (parseInt(this.get('newFurValue')) || 0));
      return this.get('newSum');
    }.property('newStoneValue', 'newWoodValue', 'newFurValue').cacheable(),

    getStoneDiff: function () {
      if(parseInt(this.get('newStoneValue')) > this.getPath('pool.resource_stone_capacity')) {
        this.set('newStoneValue', parseInt(this.getPath('pool.resource_stone_capacity')));
      }
      return (parseInt(this.get('newStoneValue')) || 0) - this.getPath('pool.resource_stone_present'); 
    }.property('pool.resource_stone_present', 'newStoneValue').cacheable(),

    getWoodDiff: function () {
      if(parseInt(this.get('newWoodValue')) > this.getPath('pool.resource_wood_capacity')) {
        this.set('newWoodValue', parseInt(this.getPath('pool.resource_wood_capacity')));
      }
      return (parseInt(this.get('newWoodValue')) || 0) - this.getPath('pool.resource_wood_present'); 
    }.property('pool.resource_wood_present', 'newWoodValue').cacheable(),

    getFurDiff: function () {
      if(parseInt(this.get('newFurValue')) > this.getPath('pool.resource_fur_capacity')) {
        this.set('newFurValue', parseInt(this.getPath('pool.resource_fur_capacity')));
      }
      return (parseInt(this.get('newFurValue')) || 0) - this.getPath('pool.resource_fur_present'); 
    }.property('pool.resource_fur_present', 'newFurValue').cacheable(),

    getRemaining: function() {
      this.set('remaining', this.get('sum') - (parseInt(this.get('newStoneValue')) || 0) - (parseInt(this.get('newWoodValue')) || 0) - (parseInt(this.get('newFurValue')) || 0));
      return this.get('remaining')
    }.property('newStoneValue', 'newWoodValue', 'newFurValue', 'pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present').cacheable(),

    checkStoneDiff: function()
    {
      this.get('getRemaining');
      this.get('getSum');
      this.get('getNewSum');
      this.get('getStoneDiff');
    }.observes('newStoneValue'),

    checkWoodDiff: function()
    {
      this.get('getRemaining');
      this.get('getSum');
      this.get('getNewSum');
      this.get('getWoodDiff');
    }.observes('newWoodValue'),

    checkFurDiff: function()
    {
      this.get('getRemaining');
      this.get('getSum');
      this.get('getNewSum');
      this.get('getFurDiff');
    }.observes('newFurValue'),
    /* html classes */
    /* doesn't work for some reason */
    /*remainingClass: function() {
      return (this.get('remaining') < 0 ? 'red-color' : '');
    }.property('remaining'),*/

    /* actions */
    exchangeClicked: function() {
      if (isNaN(parseInt(this.get('newStoneValue'))) || isNaN(parseInt(this.get('newWoodValue'))) || isNaN(parseInt(this.get('newFurValue')))) {
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('resource.exchange.errors.noinput.heading'),
          message: AWE.I18n.lookupTranslation('resource.exchange.errors.noinput.text'),
        });
        WACKADOO.presentModalDialog(errorDialog);
      }

      else if(parseInt(this.get('remaining'))  < 0) {
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.heading'),
          message: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.text'),
        });
        WACKADOO.presentModalDialog(errorDialog);
      }

      else {
        this.set('loadingSend', true);
        var self = this;
        var action = AWE.Action.Fundamental.createTradeResourcesAction(self.get('newStoneValue'), self.get('newWoodValue'), self.get('newFurValue'));
        AWE.Action.Manager.queueAction(action, function(statusCode) {
          var parent = self;
          if(statusCode == 200) {
            /* update resources in client */
            AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
              parent.set('loadingSend', false);
            });
          }
          else if (statusCode == AWE.Net.CONFLICT) {
            var errorDialog = AWE.UI.Ember.InfoDialog.create({
              heading: AWE.I18n.lookupTranslation('resource.exchange.errors.noFrogs.heading'),
              message: AWE.I18n.lookupTranslation('resource.exchange.errors.noFrogs.text'),
            });
            WACKADOO.presentModalDialog(errorDialog);
            self.destroy();
          }
          else {
            var errorDialog = AWE.UI.Ember.InfoDialog.create({
              heading: AWE.I18n.lookupTranslation('resource.exchange.errors.failed.heading'),
              message: AWE.I18n.lookupTranslation('resource.exchange.errors.failed.text'),
            });
            WACKADOO.presentModalDialog(errorDialog);
            self.destroy();
          }
        });
      }

      return false;
    },

    resetClicked: function() {
      this.init();
      return false;
    },

    cancelClicked: function() {
      this.destroy();
      return false;
    },
  });

module.TradeNewView = module.PopUpDialog.extend( /** @lends AWE.UI.Ember.ProfileView# */ {
    templateName: 'player-to-player-trade-view-new',
    settlement: null,
    controller: null,

  });

module.TradeNewTabView = module.TabViewNew.extend({

    settlement: null,
    controller: null,

    init: function() {

     this.set('tabViews', [
       { key:   "tab1",
         title: AWE.I18n.lookupTranslation('settlement.trade.update'), 
         view:  module.TradingCartActionNewView.extend({ 
            settlementBinding: "parentView.parentView.settlement", 
            controllerBinding:  "parentView.parentView.controller", 
          }),
         buttonClass: "left-menu-button"
       }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
       { key:   "tab2",
         title: AWE.I18n.lookupTranslation('settlement.trade.send'), 
         view:  module.PlayerToPlayerTradeNewView.extend({ 
            settlementBinding: "parentView.parentView.settlement", 
            controllerBinding:  "parentView.parentView.controller", 
          }),
         buttonClass: "middle-menu-button"
       },
       { key:   "tab3",
         title: AWE.I18n.lookupTranslation('settlement.trade.trade'), 
         view: module.ResourceExchangeNewView.extend({ 
            settlementBinding: "parentView.parentView.settlement", 
            controllerBinding:  "parentView.parentView.controller", 
          }),
         buttonClass: "right-menu-button"
       }
     ]);

     this._super();
   },

 });

module.InOutboundTabView = module.TabViewNew.extend({

    settlement: null,
    controller: null,

    init: function() {

     this.set('tabViews', [
       { key:   "tab1",
         title: AWE.I18n.lookupTranslation('settlement.trade.outbound'),
         view:  module.OutboundTab.extend({ 
            settlementBinding: "parentView.parentView.settlement", 
            controllerBinding:  "parentView.parentView.controller", 
          }),
         buttonClass: "left-menu-button-subtab trade-status"
       }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
       { key:   "tab2",
         title: AWE.I18n.lookupTranslation('settlement.trade.inbound'),
         view:  module.InboundTab.extend({ 
            settlementBinding: "parentView.parentView.settlement", 
            controllerBinding:  "parentView.parentView.controller", 
          }),
         buttonClass: "right-menu-button-subtab trade-status"
       }
     ]);

     this._super();
   },
   cellClass: function(){
      return "cell-" + Math.round(100 / this.get("tabViews").length);
    }.property("tabViews"),

 });

module.TradingCartActionNewView = Ember.View.extend({
  templateName: 'trade-tab1-view',
  settlement: null,
  controller: null,

   });

module.PlayerToPlayerTradeNewView = module.PlayerToPlayerTradeView.extend({
  templateName: 'trade-tab2-view',
  settlement: null,
  controller: null,

   });

module.ResourceExchangeNewView = module.ResourceExchangeDialog.extend({
  templateName: 'trade-tab3-view',
  settlement: null,
  controller: null,

   });

module.ResourceTextfield = Ember.TextField.extend({
    placeholder : function () {
    return AWE.I18n.lookupTranslation('general.playerName');
  }.property().cacheable(),
  });

module.SendResourceRangeView  = Ember.TextField.extend({
    classNames: ["resource-range-slider"],
    attributeBindings: ["min", "max"],
    resourceType: null,
    settlement: null,
    min: 0,
    type: "range",
    maxAmount: null,
    currentID: null,
    max: function(){
      return this.get("maxAmount");
    }.property('maxAmount').cacheable(),
    onValueChanged: function(){
      this.set('currentID', this.getPath('resourceType.type.id'));
      return true;
    }.observes('value'),
    onAmountChanged: function(){
      this.set('value', this.getPath('resourceType.amount'));
      return true;
    }.observes('resourceType.amount'),
  });

module.OutboundTab = Ember.View.extend({
    templateName: "outbound-tab-view",
    });
module.InboundTab = Ember.View.extend({
    templateName: "inbound-tab-view",
    });
module.TradingCartActionCellView = module.TradingCartActionView.extend({
    templateName: "trading-cart-action-new-view",

    timeRemaining: null,
    timer:         null,

    calcTimeRemaining: function() {
      var finishedAt = null;//this.getPath('job.active_job.finished_total_at');
      if(this.getPath('tradingCartAction.returning'))
        {
          finishedAt = this.getPath('tradingCartAction.returned_at');
        }
        else
        {
          finishedAt = this.getPath('tradingCartAction.target_reached_at');
        }
      if (!finishedAt) {
        return ;
      }
      var finish = Date.parseISODate(finishedAt);
      var now = new Date();
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;
      this.set('timeRemaining', remaining);
      //debugger
    //totalJobsRemainingFactor: null,
    },

    startTimer: function() {
      var timer = this.get('timer');
      if (!timer) {
        timer = setInterval((function(self) {
          return function() {
            self.calcTimeRemaining();
          };
        }(this)), 1000);
        this.set('timer', timer);
      }
    },

    stopTimer: function() {
      var timer = this.get('timer');
      if (timer) {
        clearInterval(timer);
        this.set('timer', null);
      }
    },

    didInsertElement: function() {
      this.startTimer();
    },
    
    willDestroyElement: function() {
      this.stopTimer();
    },

    formatedRemainingTime: function(){
      var remTime = this.get('timeRemaining');
      return this.formatSecondsForJob(remTime);
    }.property('timeRemaining').cacheable(),

    formatSecondsForJob: function (seconds)
    {
      var t = new Date(1970,0,1);
      t.setSeconds(seconds);
      var s = t.toTimeString().substr(0,8);
      if(seconds > 86399)
        s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
      return s;
    },

    });
//NEW DIALOGS END

  return module;
    
}(AWE.UI.Ember || {}));




