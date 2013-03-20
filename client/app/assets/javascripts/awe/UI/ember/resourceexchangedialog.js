/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

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

    /* properties */
    getSum: function() {
      this.set('sum', this.getPath('pool.resource_stone_present') + this.getPath('pool.resource_wood_present') + this.getPath('pool.resource_fur_present'));
      return this.get('sum');
    }.property('pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present').cacheable(),

    getNewSum: function() {
      this.set('newSum', parseInt(this.get('newStoneValue')) + parseInt(this.get('newWoodValue')) + parseInt(this.get('newFurValue')));
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
      this.set('remaining', this.get('sum') - parseInt(this.get('newStoneValue') || 0) - parseInt(this.get('newWoodValue') || 0) - parseInt(this.get('newFurValue') || 0));
      return this.get('remaining');
    }.property('newStoneValue', 'newWoodValue', 'newFurValue', 'pool.resource_stone_present', 'pool.resource_wood_present', 'pool.resource_fur_present').cacheable(),

    /* html classes */
    /* doesn't work for some reason */
    /*remainingClass: function() {
      return (this.get('remaining') < 0 ? 'red-color' : '');
    }.property('remaining'),*/

    /* actions */
    exchangeClicked: function() {
      /* TODO: add submit functionality */
      return false;
    },

    resetClicked: function() {
      /* TODO: reset dialog */
      return false;
    },

    cancelClicked: function() {
      this.destroy();
      return false;
    },
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

