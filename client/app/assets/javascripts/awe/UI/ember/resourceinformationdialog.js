/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.ResourceInformationDialog = module.PopUpDialog.extend({
    templateName: 'resource-information-dialog',
    classNames: ['resource-information-dialog'],

    init: function() {
      this._super();     
      this.set('pool', AWE.GS.ResourcePoolManager.getResourcePool());
      this.set('rules', AWE.GS.RulesManager.getRules());
    },

    amount: function() {
      return Math.floor(parseFloat(this.get("pool").presentAmount(this.getPath("resource.symbolic_id")) || "0.0"));
    }.property("resource", "pool"),

    bonus: function() {
      var charEffects   = parseFloat(this.get("pool").get(this.getPath("resource.symbolic_id")+'_production_bonus_effects') || "0.0");
      var allyEffects   = parseFloat(this.get("pool").get(this.getPath("resource.symbolic_id")+'_production_bonus_alliance') || "0.0");
      return Math.floor((charEffects+allyEffects)*1000) / 1000.0;
    }.property("resource", "pool"),

    productionRate: function() {
      var rate = parseFloat(this.get("pool").get(this.getPath("resource.symbolic_id")+'_production_rate') || "0.0");
      return Math.floor(rate*10) / 10.0;
    }.property("resource", "pool"),

    capacity: function() {      
      return Math.floor(parseFloat(this.get("pool").get(this.getPath("resource.symbolic_id")+'_capacity') || "0.0"));
    }.property("resource", "pool"),

    resource: function() {
      var that = this;
      this.getPath("rules.resource_types").forEach(function(item) {
        if (item.symbolic_id === that.get("resourceName")){
          that.item = item;
        }
      });
      if (that.item){ return that.item; } 
    }.property("resourceName", "pool", "rules"),

    description: function(){
      return this.getPath("resource.description");
    }.property("resource"),

    name: function(){
      return this.getPath("resource.name");
    }.property("resource"),
    
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




