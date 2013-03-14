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
    stone: null,
    wood: null,
    fur: null,
    stone_capacity: null,
    wood_capacity: null,
    fur_capacity: null,
    sum: null,
    left: null,       /* left over */
    loading: null,    /* init loading */
    loading2: null,   /* exchange loading */

    init: function() {
      this._super();
      this.set('loading', true);
      var self = this;

      AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
        self.updateResources();
        self.set('loading', false);
      });
    },

    updateResources: function() {
        this.set('stone', AWE.GS.ResourcePoolManager.getResourcePool().presentAmount('resource_stone'));
        this.set('wood',  AWE.GS.ResourcePoolManager.getResourcePool().presentAmount('resource_wood'));
        this.set('fur',   AWE.GS.ResourcePoolManager.getResourcePool().presentAmount('resource_fur'));
        this.set('stone_capacity', Math.floor(AWE.GS.ResourcePoolManager.getResourcePool().resource_stone_capacity));
        this.set('wood_capacity',  Math.floor(AWE.GS.ResourcePoolManager.getResourcePool().resource_wood_capacity));
        this.set('fur_capacity',   Math.floor(AWE.GS.ResourcePoolManager.getResourcePool().resource_fur_capacity));
        this.set('sum',   this.get('stone')+this.get('wood')+this.get('fur'));
        this.set('left',  0); /* initial value is always 0 */
    },

    /* return html class for properties */
    stoneClass: function() {
      if(this.get('stone') < 0) this.set('stone', this.get('stone')*(-1));
      this.set('left', this.leftOver());
      return this.get('stone') > this.get('stone_capacity') ? 'red-color bold' : '';
    }.property('stone'),
   
    woodClass: function() {
      if(this.get('wood') < 0) this.set('wood', this.get('wood')*(-1));
      this.set('left', this.leftOver());
      return this.get('wood') > this.get('wood_capacity') ? 'red-color bold' : '';
    }.property('wood'),
   
    furClass: function() {
      if(this.get('fur') < 0) this.set('fur', this.get('fur')*(-1));
      this.set('left', this.leftOver());
      return this.get('fur') > this.get('fur_capacity') ? 'red-color bold' : '';
    }.property('fur'),

    remainingClass: function() {
      return this.left < 0 ? 'red-color bold' : '';
    }.property('left'),

    /* values */
    leftOver: function() {
      return this.get('sum')-this.get('stone')-this.get('wood')-this.get('fur');
    },

    /* actions */
    fill: function(res) {
      this.set(res, parseInt(this.get(res))+this.get('left'));
    },

    fillStone: function() {
      this.fill('stone');
    },

    fillWood: function() {
      this.fill('wood');
    },

    fillFur: function() {
      this.fill('fur');
    },

    okClicked: function() {
      var self = this;

      /* distributed to many resources (left over < 0) */
      if(this.leftOver() < 0) {
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.heading'),
          message: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.left'),
        });
        WACKADOO.presentModalDialog(errorDialog);
      }

      else if(this.leftOver() > 0) {
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('resource.exchange.errors.tooless.heading'),
          message: AWE.I18n.lookupTranslation('resource.exchange.errors.tooless.text'),
        });
        WACKADOO.presentModalDialog(errorDialog);
      }

      else if(AWE.GS.ResourcePoolManager.getResourcePool().presentAmount('resource_cash') < 3) {
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('resource.exchange.errors.tooless.heading'),
          message: AWE.I18n.lookupTranslation('resource.exchange.errors.tooless.cash'),
        });
        WACKADOO.presentModalDialog(errorDialog);
      }

      /* distributed too much stone */
      else if(this.get('stone') > this.get('stone_capacity')) {
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.heading'),
          message: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.stone'),
        });
        WACKADOO.presentModalDialog(errorDialog);
      }

      else if(this.get('wood') > this.get('wood_capacity')) {
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.heading'),
          message: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.wood'),
        });
        WACKADOO.presentModalDialog(errorDialog);
      }

      else if(this.get('fur') > this.get('fur_capacity')) {
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.heading'),
          message: AWE.I18n.lookupTranslation('resource.exchange.errors.toomuch.fur'),
        });
        WACKADOO.presentModalDialog(errorDialog);
      }

      else if(isNaN(this.get('stone')) || isNaN(this.get('wood')) || isNaN(this.get('fur'))) {
        var errorDialog = AWE.UI.Ember.InfoDialog.create({
          heading: AWE.I18n.lookupTranslation('resource.exchange.errors.isnan.heading'),
          message: AWE.I18n.lookupTranslation('resource.exchange.errors.isnan.text'),
        });
        WACKADOO.presentModalDialog(errorDialog);
      }

      else {
        this.set('loading2', true);
        var self = this;
        var action = AWE.Action.Fundamental.createTradeResourcesAction(
            /* round up to avoid rounding errors on the server side */
            Math.ceil( (this.get('stone')/this.get('sum'))*100 ) / 100,
            Math.ceil( (this.get('wood') /this.get('sum'))*100 ) / 100,
            Math.ceil( (this.get('fur')  /this.get('sum'))*100 ) / 100);
        AWE.Action.Manager.queueAction(action, function(statusCode) {
          var parent = self;
          if(statusCode == 200) {
            /* update resources in client */
            AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
              parent.updateResources();
              parent.set('loading2', false);
              parent.destroy();
            });
          } else {
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

    cancelPressed: function() {
      this.destroy();
      return false;
    },
  });
  
  return module;
    
}(AWE.UI.Ember || {}));

