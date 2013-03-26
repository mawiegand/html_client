var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.ResourceExchangeDialog = module.Dialog.extend({
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
              parent.destroy();
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
  
  return module;
    
}(AWE.UI.Ember || {}));

