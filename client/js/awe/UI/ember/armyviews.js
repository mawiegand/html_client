/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/armyviews.html');

  
  module.ArmyInfoView = Ember.View.extend({
    templateName: "army-info-view",
    
    army: null,

    displayUnits: function() {
      return this.getPath('units.length') > 0;
    }.property('units.length').cacheable(),
    
    isChangeNamePossible: function() {
      return !this.getPath('army.isGarrisonProp') && this.get('isOwnArmy');
    }.property('army.isGarrisonProp', 'isOwnArmy').cacheable(),
    
    isOwnArmy: function() {
      var army = this.get('army'); 
      return army ? army.isOwn() : false;
    }.property('army.owner_id').cacheable(),
    
    isAlliedArmy: function() {
      var army = this.get('army'); 
      return army ? army.isRelationAtLeast(RELATION_TYPE_ALLIED) : false;
    }.property('army.owner_id', 'army.alliance_id').cacheable(),    
    
    armyObserver: function() {   /// TODO: hm, what was the intention behind doing this with an observer????
      if (this.get('army')) {
        AWE.GS.ArmyManager.updateArmy(this.getPath('army.id'), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('army'),

    units: function() {
      var list = [];
      var army = this.get('army');
      var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types');
      if (army && army.details) { log('build list')
        AWE.Ext.applyFunction(unitTypes, function(unitType) {
          if (army.details[unitType.db_field] !== undefined && army.details[unitType.db_field] > 0) {
            list.push({ name: unitType.name, number: army.details[unitType.db_field] }) ;
          }
        });
      }
      return list;
    }.property('army.details', 'army.details.@each').cacheable(),
    
    message: function() {
      var own = this.get('isOwnArmy');
      if (own === undefined || own === null) {
        return null; // return nothing, if value hasn't been computed so far.
      }
      return this.get('isOwnArmy') ? AWE.I18n.lookupTranslation('army.messages.own') : AWE.I18n.lookupTranslation('army.messages.other');
    }.property('isOwnArmy').cacheable(),
    
  });
  
  module.ArmyCreateDialog = module.Dialog.extend({
    templateName: 'army-create-dialog',
    
    locationId: null,
    garrisonArmy: null,
    garrisonArmyObserver: function() {
      log('ping');
      if (this.get('garrisonArmy')) {
        log('pong');
        AWE.GS.ArmyManager.updateArmy(this.get('garrisonArmy').getId(), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('garrisonArmy'),

    unitTypes: function() {
      var list = [];
      var details = this.getPath('garrisonArmy.details');
      var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types');
      if (details) { log('build list')
        AWE.Ext.applyFunction(unitTypes, function(unitType) {
          if (details[unitType.db_field] !== undefined && details[unitType.db_field] > 0) {
            list.push(Ember.Object.create({
              name: unitType.name.en_US,
              symbolic_id: unitType.db_field, 
              allUnits: details[unitType.db_field],
              garrisonUnits: details[unitType.db_field],
              newUnits: 0,
            }));
          }
        });
      }
      log("LIST", list, details);
      return list;
    }.property('garrisonArmy.details.@each').cacheable(),
    
    unitQuantities: function() {
      var unitQuantities = {};
      var unitTypes = this.get('unitTypes');
      unitTypes.forEach(function(unitType) {
        var quantity = unitType.get('newUnits');
        if (quantity > 0) {
          unitQuantities[unitType.get('symbolic_id')] = quantity; 
        }
      });
      
      return unitQuantities;
    },
        
    createPressed: function() {
      log('ERROR Action not connected: createWasPressed.');
    },
    
    cancelPressed: function() {
      log('ERROR Action not connected: cancelWasPressed.');
    },
    
    allToGarrison: function(){
    },
    
    allToNew: function(){
    },
    
    loading: null,
    
    init: function() {
      this._super();      
    },
    
  });
  
  module.UnitRowView = Ember.View.extend({
    unitType: null,
    
    allToGarrison: function(){
      this.setPath('unitType.garrisonUnits', this.getPath('unitType.allUnits'));
      this.setPath('unitType.newUnits', 0);
    },
    
    oneToGarrison: function(){
      var garrisonUnits = parseInt(this.getPath('unitType.garrisonUnits'));
      var newUnits = parseInt(this.getPath('unitType.newUnits'));
      if (newUnits > 0) {
        this.setPath('unitType.garrisonUnits', garrisonUnits + 1);
        this.setPath('unitType.newUnits', newUnits - 1);
      }
    },
    
    oneToNew: function(){
      var garrisonUnits = parseInt(this.getPath('unitType.garrisonUnits'));
      var newUnits = parseInt(this.getPath('unitType.newUnits'));
      if (garrisonUnits > 0) {
        this.setPath('unitType.newUnits', newUnits + 1);
        this.setPath('unitType.garrisonUnits', garrisonUnits - 1);
      }
    },
    
    allToNew: function(){
      this.setPath('unitType.newUnits', this.getPath('unitType.allUnits'));
      this.setPath('unitType.garrisonUnits', 0);
    },
  });
 
  module.GarrisonArmyUnitTextfield = Ember.TextField.extend({
    
    allUnits: null,
    garrisonUnits: null,
    newUnits: null,
    
    locked: false,
    
    value: Ember.computed(function(key, value) {
      // getter
      if (arguments.length === 1) {
        return this.get('garrisonUnits');
      // setter
      } else {
        this.set('garrisonUnits', parseInt(value));
        this.set('newUnits', this.get('allUnits') - parseInt(value));
        return value;
      }
    }).property('garrisonUnits')
  });
  
  module.NewArmyUnitTextfield = Ember.TextField.extend({
    
    allUnits: null,
    garrisonUnits: null,
    newUnits: null,
    
    locked: false,
    
    value: Ember.computed(function(key, value) {
      // getter
      if (arguments.length === 1) {
        return this.get('newUnits');
      // setter
      } else {
        this.set('newUnits', parseInt(value));
        this.set('garrisonUnits', this.get('allUnits') - parseInt(value));
        return value;
      }
    }).property('newUnits')
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




