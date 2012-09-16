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
        
    okClicked: function() {
      this.destroy();
      return false;
    },
  
    productionDetails: function() {
      var self = this;
  		var productions = [];
  		var pool = this.get('pool');
  		
  		if (!pool) {
  		  return null;
  		}
  		
  	  AWE.GS.RulesManager.getRules().resource_types.forEach(function(item) {  
        var rate          = parseFloat(pool.get(item.symbolic_id+'_production_rate') || "0.0");
        var amount        = parseFloat(pool.presentAmount(item.symbolic_id) || "0.0");
        var capacity      = parseFloat(pool.get(item.symbolic_id+'_capacity') || "0.0");
        var effects       = parseFloat(pool.get(item.symbolic_id+'_production_bonus_effects') || "0.0");
        var fullInSeconds = ((capacity-amount) / rate) * 3600;
  
  	    productions.push(Ember.Object.create({  // need to return an ember project so bindings on resourceType.name do work inside local helper
          rate:         Math.floor(rate*10) / 10.0,
          dailyRate:    Math.floor(rate*24),
          amount:       Math.floor(amount),
          effects:      Math.floor(effects*10) / 10.0,
          capacity:     Math.floor(capacity),
          fillDuration: Math.floor(fullInSeconds),
          filled:       amount >= capacity,
          fillNever:    rate <= 0.000001 || fullInSeconds > 9999999,
          resourceType: item,
        }));
      });
      return productions;
    }.property('pool.updated_at'),  
    
    pressedShop: function() {
      WACKADOO.hudController.ingameShopButtonClicked();
      this.destroy();
      return false; // prevent default behavior
    },
  
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




