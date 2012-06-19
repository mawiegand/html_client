/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/armyviews.html');
  
  module.ArmyInfoDialog = module.Dialog.extend({
    templateName: 'army-info-dialog',
    
    army: null,
        
    init: function() {
      this._super();      
    },
    
    changeNamePressed: function() {
      log('ERROR Action not connected: changeNameWasPressed.');
    },
  });
  
  module.ArmyInfoView = Ember.View.extend({
    templateName: "army-info-view",
    
    army: null,
    
    armyObserver: function() {
      if (this.get('army')) {
        AWE.GS.ArmyManager.updateArmy(this.get('army').getId(), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('army'),

    units: function() {
      var list = [];
      var army = this.get('army');
      var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types');
      if (army.details) { log('build list')
        AWE.Ext.applyFunction(unitTypes, function(unitType) {
          if (army.details[unitType.db_field] !== undefined && army.details[unitType.db_field] > 0) {
            list.push({ name: unitType.name.en_US, number: army.details[unitType.db_field] }) ;
          }
        });
      }
      log("LIST", list, army, army.details);
      return list;
    }.property('army.details.@each').cacheable(),
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




