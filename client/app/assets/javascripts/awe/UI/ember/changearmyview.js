/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
    
  module.ArmyNewChangeDialog = module.PopUpDialog.extend({
    templateName: 'army-new-change-dialog',
    
    locationId: null,
    garrisonArmy: null,
	otherArmy: null,
  });
  
  module.ArmyNewCreateDialog = module.PopUpDialog.extend({
    templateName: 'army-new-create-dialog',
    
    locationId: null,
    garrisonArmy: null,
	otherArmy: null,
  });
  
  
  module.ArmyAbstractView  = Ember.View.extend ({
  });
  
  module.ArmyCreateView    = module.ArmyAbstractView.extend({
  });
  

  module.ArmyNewChangeView = module.ArmyAbstractView.extend ({
    templateName: 'army-new-change-content-view',

    unitTypesChange: null,
    garrisonArmy: null,
    otherArmy: null,
    locationId: null,
    
	garrisonArmyObserver: function() {
      if (this.get('garrisonArmy')) {
        AWE.GS.ArmyManager.updateArmy(this.get('garrisonArmy').getId(), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('garrisonArmy'),


    garrisonSum: function(){
      var sum = 0;
      this.get('unitTypes').forEach(function(unitType){
        sum += unitType.get('garrisonUnits');
      });
      return sum;
    }.property('unitTypes.@each.garrisonUnits').cacheable(),
    
    otherSum: function(){
      var sum = 0;
      this.get('unitTypes').forEach(function(unitType){
        sum += unitType.get('otherUnits');
      });
      return sum;
    }.property('unitTypes.@each.garrisonUnits').cacheable(),
    
    garrisonOverfull: function() {
      return this.get('garrisonSum') > this.getPath('garrisonArmy.size_max');
    }.property('unitTypes.@each.garrisonUnits').cacheable(),
    
    otherOverfull: function() {
      return this.get('otherSum') > this.get('otherArmySizeMax');
    }.property('unitTypes.@each.garrisonUnits').cacheable(),      
        
    garrisonOverfullClass: function() {
      return this.get('garrisonOverfull') ? "red-color bold" : "green-color bold";
    }.property('garrisonOverfull').cacheable(),
    
    otherOverfullClass: function() {
      return this.get('otherOverfull') ? "red-color bold" : "green-color bold";
    }.property('otherOverfull').cacheable(),      
        
    cancelPressed: function() {
      log('ERROR Action not connected: cancelWasPressed.');
    },
    
    allToGarrison: function() {
      this.get('unitTypes').forEach(function(unitType){
        unitType.set('garrisonUnits', unitType.get('allUnits'));
        unitType.set('otherUnits', 0);
      });
    },
    
    allToOther: function() {
      this.get('unitTypes').forEach(function(unitType){
        unitType.set('garrisonUnits', 0);
        unitType.set('otherUnits', unitType.get('allUnits'));
      });
    },
    
    reset: function() {
      this.set('unitTypesChange', new Date);
    },
    
    loading: null,
    
    init: function() {
      this._super();      
    },
    
    otherArmy: null,
    otherArmyObserver: function() {
      if (this.get('otherArmy')) {
        AWE.GS.ArmyManager.updateArmy(this.get('otherArmy').getId(), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('otherArmy'),
    
    otherArmySizeMaxBinding: 'otherArmy.size_max',

    unitTypes: function() {
      var list = [];
      var garrisonDetails = this.getPath('garrisonArmy.details');
      var otherDetails = this.getPath('otherArmy.details');
      var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types');
      if (garrisonDetails && otherDetails) { log('build list')
        AWE.Ext.applyFunction(unitTypes, function(unitType) {
          if ((garrisonDetails[unitType.db_field] !== undefined && garrisonDetails[unitType.db_field] > 0) ||
              (otherDetails[unitType.db_field] !== undefined && otherDetails[unitType.db_field] > 0)) {
            list.push(Ember.Object.create({
              name: unitType.name,
              symbolic_id: unitType.db_field, 
              allUnits: garrisonDetails[unitType.db_field] + otherDetails[unitType.db_field],
              garrisonUnits: garrisonDetails[unitType.db_field],
              otherUnits: otherDetails[unitType.db_field],
            }));
          }
        });
      }
      // log("LIST", list, details);
      return list;
    }.property('garrisonArmy.details.@each', 'otherArmy.details.@each', 'unitTypesChange').cacheable(),
    
    unitDifferences: function() {
      var unitDifferences = {};
      var unitTypes = this.get('unitTypes');
      var otherDetails = this.getPath('otherArmy.details');
      unitTypes.forEach(function(unitType) {
        var difference = unitType.get('otherUnits') - otherDetails[unitType.get('symbolic_id')];
        if (difference != 0) {
          unitDifferences[unitType.get('symbolic_id')] = difference; 
        }
      });
      return unitDifferences;
    },

    changePressed: function() {
      log('ERROR Action not connected: changeWasPressed.');
    },
  
     
  });
  
  return module;
    
}(AWE.UI.Ember || {}));