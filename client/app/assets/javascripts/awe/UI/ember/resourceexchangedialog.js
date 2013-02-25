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
    left: null,
    loading: null,
    loading2: null,
    /* Timervariablen */
    /*seconds: null,
    timer: null,*/

    init: function() {
      this._super();
      this.set('loading', true);
      var self = this;

      AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
        self.updateResources();
        self.set('loading', false);
      });
      
      /* Timer zum Atkualisieren */
      /*var self = this;
      this.set('timer', setInterval(function() {
	      self.updateResources();
      }, 500));*/
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

    stoneClass: function() {
      this.set('left', this.leftOver());
      return this.get('stone') > this.get('stone_capacity') ? 'red-color bold' : '';
    }.property('stone'),
   
    woodClass: function() {
      this.set('left', this.leftOver());
      return this.get('wood') > this.get('wood_capacity') ? 'red-color bold' : '';
    }.property('wood'),
   
    furClass: function() {
      this.set('left', this.leftOver());
      return this.get('fur') > this.get('fur_capacity') ? 'red-color bold' : '';
    }.property('fur'),

    leftOver: function() {
      return this.get('sum')-this.get('stone')-this.get('wood')-this.get('fur');
    },

    remainingClass: function() {
      return this.left < 0 ? 'red-color bold' : '';
    }.property('left'),
   
    /*
    willDestroyElement: function() {
      var timer = this.get('timer');
      if (timer) {
        clearInterval(timer);
      }
    },*/ 

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

      else {
        this.set('loading2', true);
        var self = this;
        var action = AWE.Action.Fundamental.createTradeResourcesAction((this.get('stone')/this.get('sum')), (this.get('wood')/this.get('sum')),  (this.get('fur')/this.get('sum')));
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




