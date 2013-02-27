/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.ResourceDetailsDialog = module.Dialog.extend({
    templateName: 'resource-details-dialog',
    
    pool: null,
    seconds: null,
    timer: null,
        
    okPressed: function() {
      this.destroy();
      return false;
    },

    didInsertElement: function() {
      var self = this;
      var timer = setInterval(function() {
        self.set('seconds', Math.floor(new Date().getTime() / 1000));
      }, 500);
      this.set('timer', timer);
    },

    willDestroyElement: function() {
      var timer = this.get('timer');
      if (timer) {
        clearInterval(timer);
      }
    },

    productionDetails: function() {
      var productions = [];
      var pool = this.get('pool');

      if (!pool) {
        return null;
      }

      AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {
        var rate          = parseFloat(pool.get(item.symbolic_id+'_production_rate') || "0.0");
        var amount        = parseFloat(pool.presentAmount(item.symbolic_id) || "0.0");
        var capacity      = parseFloat(pool.get(item.symbolic_id+'_capacity') || "0.0");
        var charEffects   = parseFloat(pool.get(item.symbolic_id+'_production_bonus_effects') || "0.0");
        var allyEffects   = parseFloat(pool.get(item.symbolic_id+'_production_bonus_alliance') || "0.0");
        var fullInSeconds = ((capacity-amount) / rate) * 3600;

        productions.push(Ember.Object.create({  // need to return an ember project so bindings on resourceType.name do work inside local helper
          rate:             Math.floor(rate*10) / 10.0,
          dailyRate:        Math.floor(rate*24),
          amount:           Math.floor(amount),
          characterEffects: Math.floor(charEffects*1000) / 1000.0,
          allianceEffects:  Math.floor(allyEffects*1000) / 1000.0,
          capacity:         Math.floor(capacity),
          fillDuration:     Math.floor(fullInSeconds),
          filled:           amount >= capacity,
          fillNever:        rate <= 0.000001 || fullInSeconds > 9999999,
          resourceType:     item,
        }));
      });
      return productions;
    }.property('pool.updated_at', 'seconds'),

    shopPressed: function() {
      WACKADOO.hudController.ingameShopButtonClicked();
      this.destroy();
      return false; // prevent default behavior
    },

    effectDetailsPressed: function() {
      var dialog = AWE.UI.Ember.EffectDetailsDialog.create({
        resourcePool: this.get('pool'),
      });
      WACKADOO.presentModalDialog(dialog);
    },
  
  });

  module.EffectDetailsDialog = module.Dialog.extend({
    templateName: 'effect-details-dialog',

    resourcePool: null,
    characterResourceEffects: null,
    allianceResourceEffects: null,

    init: function() {
      this._super();
      this.setAndUpdateCharacterResourceEffects();
      this.setAndUpdateAllianceResourceEffects();
    },

    setAndUpdateCharacterResourceEffects: function() {
      var self = this;
      AWE.GS.CharacterResourceEffectManager.updateOwnResourceEffects(null, function(result, status, xhr, timestamp) {
        self.set('characterResourceEffects', AWE.GS.CharacterResourceEffectManager.getResourceEffectsOfResourcePool(self.getPath('resourcePool.id')))
      });
    },

    setAndUpdateAllianceResourceEffects: function() {
      var self = this;
      AWE.GS.AllianceResourceEffectManager.updateAllianceResourceEffects(null, function(result, status, xhr, timestamp) {
        self.set('allianceResourceEffects', AWE.GS.AllianceResourceEffectManager.getResourceEffectsOfAlliance(AWE.GS.game.getPath('currentCharacter.alliance_id')))
      });
    },

    allianceIdObserver: function() {
      this.setAndUpdateAllianceResourceEffects();
    }.observes('AWE.GS.game.currentCharacter.alliance_id'),

    resourceTypes: function() {
      return AWE.GS.RulesManager.getRules().resource_types;
    }.property('pool.updated_at', 'seconds'),

    characterResourceEffectDetails: function() {
      var effectDetails = [];
      var characterResourceEffects = this.get('characterResourceEffects');

      if (characterResourceEffects != null) {
        characterResourceEffects.forEach(function(effect) {
          var effectDetail = Ember.Object.create({
            typeName: effect.get('type'),
          });
          AWE.GS.RulesManager.getRules().resource_types.forEach(function(resourceType) {
            var value = effect.get('resource_id') == resourceType.id ? effect.get('bonus') : 0;
            effectDetail.set(resourceType.symbolic_id, value);
          });
          effectDetails.push(effectDetail);
        });
      }

      return effectDetails;
    }.property('characterResourceEffects', 'characterResourceEffects.@each').cacheable(),

    allianceResourceEffectDetails: function() {
      var effectDetails = [];
      var allianceResourceEffects = this.get('allianceResourceEffects');

      if (allianceResourceEffects != null) {
        allianceResourceEffects.forEach(function(effect) {
          var effectDetail = Ember.Object.create({
            typeName: effect.get('type'),
          });
          AWE.GS.RulesManager.getRules().resource_types.forEach(function(resourceType) {
            var value = effect.get('resource_id') == resourceType.id ? effect.get('bonus') : 0;
            effectDetail.set(resourceType.symbolic_id, value);
          });
          effectDetails.push(effectDetail);
        });
      }

      return effectDetails;
    }.property('allianceResourceEffects', 'allianceResourceEffects.@each').cacheable(),

    loadingCharacterEffects: function() {
      return this.get('characterResourceEffects') == null;
    }.property('characterResourceEffects').cacheable(),

    loadingAllianceEffects: function() {
      return this.get('allianceResourceEffects') == null;
    }.property('allianceResourceEffects').cacheable(),

    okPressed: function() {
      this.destroy();
    },
  });

  module.ResourceEffectDetail = Ember.View.extend({
    effect: null,
    resource: null,
    value: function() {
      var effect = this.get('effect');
      var symbolicId = this.getPath('resource.symbolic_id');
      if (effect != null && symbolicId != null) {
        return effect.get(symbolicId);
      }
      else {
        return 0;
      }
    }.property('effect', 'resource').cacheable(),
  });

  module.CharacterResourceDetail = Ember.View.extend({
    resource: null,
    resourcePool: null,
    value: function() {
      var resourcePool = this.get('resourcePool');
      var symbolicId = this.getPath('resource.symbolic_id');
      if (resourcePool != null && symbolicId != null) {
        return resourcePool.get(symbolicId + '_production_bonus_effects');
      }
      else {
        return 0;
      }
    }.property('resource', 'resourcePool').cacheable(),
  });

  module.AllianceResourceDetail = Ember.View.extend({
    resource: null,
    resourcePool: null,
    value: function() {
      var resourcePool = this.get('resourcePool');
      var symbolicId = this.getPath('resource.symbolic_id');
      if (resourcePool != null && symbolicId != null) {
        return resourcePool.get(symbolicId + '_production_bonus_alliance');
      }
      else {
        return 0;
      }
    }.property('resource', 'resourcePool').cacheable(),
  });

  return module;
    
}(AWE.UI.Ember || {}));




