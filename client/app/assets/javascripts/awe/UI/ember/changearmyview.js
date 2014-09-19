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

    changePressed: function() {
      log('ERROR Action not connected: changeWasPressed.');
    },
//Functions in parent
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
              unitCategory: unitType.category,
              unitAttack: unitType.attack,
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
  });
  
  
  module.ArmyAbstractView  = Ember.View.extend ({

    locationId: null,
    garrisonArmy: null,
    
    garrisonArmyObserver: function() {
      if (this.get('garrisonArmy')) {
        AWE.GS.ArmyManager.updateArmy(this.get('garrisonArmy').getId(), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('garrisonArmy'),

    unitTypesChange: null,

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
    
  
  
  });
  
  module.ArmyNewChangeView = module.ArmyAbstractView.extend ({
    templateName: 'army-new-change-content-view',
	  unitTypes: null,
	  garrisonArmy: null,
    otherArmy: null,
    otherArmyObserver: function() {
      if (this.get('otherArmy')) {
        AWE.GS.ArmyManager.updateArmy(this.get('otherArmy').getId(), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('otherArmy'),
    
    otherArmySizeMaxBinding: 'otherArmy.size_max',

    infatry_strength: function(){
      var infatry_strength_total = 0;
      var unitTypes = this.get('unitTypes');
      unitTypes.forEach(function(unitType) 
      {
        if(unitType.get('unitCategory') == 0)//infantry
          infatry_strength_total += parseInt(unitType.get('unitAttack'))*parseInt(unitType.get('otherUnits'));
      });
        return infatry_strength_total;
    }.property('unitTypes.@each.otherUnits').cacheable(),

    cavalry_strength: function(){
      var cavalry_strength_total = 0;
      var unitTypes = this.get('unitTypes');
      unitTypes.forEach(function(unitType) 
      {
        if(unitType.get('unitCategory') == 1)//cavalery
          cavalry_strength_total += parseInt(unitType.get('unitAttack'))*parseInt(unitType.get('otherUnits'));
      });
        return cavalry_strength_total;
    }.property('unitTypes.@each.otherUnits').cacheable(),

    archer_strength: function(){
      var archer_strength_total = 0;
      var unitTypes = this.get('unitTypes');
      unitTypes.forEach(function(unitType) 
      {
        if(unitType.get('unitCategory') == 2)//artillery
          archer_strength_total += parseInt(unitType.get('unitAttack'))*parseInt(unitType.get('otherUnits'));
      });
        return archer_strength_total;
    }.property('unitTypes.@each.otherUnits').cacheable(),


    total_army_strength: function(){
      var infatry_strength_total = 0;
      var unitTypes = this.get('unitTypes');
      unitTypes.forEach(function(unitType) 
      {
         infatry_strength_total += unitType.get('unitAttack')*unitType.get('otherUnits');
      });
        return infatry_strength_total;
    }.property('unitTypes.@each.otherUnits').cacheable(),

    totalArmyUnits: function()
    {
      var total = 0;
      var unitTypes = this.get('unitTypes');
      unitTypes.forEach(function(unitType) 
      {
         total += parseInt(unitType.get('otherUnits'));
      });
        return total;
    }.property('unitTypes.@each.otherUnits').cacheable(),
    /*unitTypes: function() {
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
              unitCategory: unitType.category,
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
    },*/

    changePressed: function() {
      log('ERROR Action not connected: changeWasPressed.');
    },
  
});
  
  module.ArmyChangeTabView = module.TabViewNew.extend({

    locationId: null,
    garrisonArmy: null,
	  otherArmy: null,
	  unitTypes: null,
    init: function() {

     this.set('tabViews', [
       { key:   "tab1",
         title: "Infantry", 
         view:  module.ArmyChangeInfantryView,
         buttonClass: "left-menu-button"
       }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
       { key:   "tab2",
         title: "Artillery", 
         view:  module.ArmyChangeArtilleryView,
         buttonClass: "middle-menu-button"
       },
       { key:   "tab3",
         title: "Cavelery", 
         view: module.ArmyChangeCavalryView,
         buttonClass: "right-menu-button"
       }
     ]);

     this._super();
   },
 });
 

module.ArmyRangeView  = Ember.TextField.extend({  
    //templateName: 'army-range-view',
    //tagName: "input",
    classNames: ["army-type-range"],
    unitType: null,
    attributeBindings: ["min", "max"],
    min: 0,
    type: "range",
    valueBinding: "unitType.otherUnits",
    max: function(){
      return this.getPath("unitType.allUnits");
    }.property("unitType.allUnits").cacheable(),

    rangeCurrentValue: 0,
    getCurrentRangeValue: function(){
      return this.get('rangeCurrentValue');
    }.property('rangeCurrentValue').cacheable(),

    setNewValues: function(){
      var value = this.getPath("unitType.allUnits") - this.get("value");
      this.setPath('unitType.garrisonUnits', value);
    }.observes("value"),
    
    allToGarrison: function(){
      this.setPath('unitType.garrisonUnits', this.getPath('unitType.allUnits'));
      this.setPath('unitType.otherUnits', 0);
    },
    
    oneToGarrison: function(){
      var garrisonUnits = parseInt(this.getPath('unitType.garrisonUnits'));
      var otherUnits = parseInt(this.getPath('unitType.otherUnits'));
      if (otherUnits > 0) {
        this.setPath('unitType.garrisonUnits', garrisonUnits + 1);
        this.setPath('unitType.otherUnits', otherUnits - 1);
      }
    },
    
    oneToOther: function(){
      var garrisonUnits = parseInt(this.getPath('unitType.garrisonUnits'));
      var otherUnits = parseInt(this.getPath('unitType.otherUnits'));
      if (garrisonUnits > 0) {
        this.setPath('unitType.otherUnits', otherUnits + 1);
        this.setPath('unitType.garrisonUnits', garrisonUnits - 1);
      }
    },
    
    allToOther: function(){
      this.setPath('unitType.otherUnits', this.getPath('unitType.allUnits'));
      this.setPath('unitType.garrisonUnits', 0);
    }

});

   module.ArmyChangeInfantryView  = Ember.View.extend ({
   
   	templateName: 'army-new-change-tab1-view',
   	
    garrisonArmyBinding: "parentView.parentView.garrisonArmy",
    otherArmyArmyBinding: "parentView.parentView.otherArmy",
    locationIdBinding: "parentView.parentView.locationId",
    unitTypesBinding: "parentView.parentView.unitTypes",

     //infantry
    unityTypeID: 0,
    
   	activeArmyTypen: function()
   	{
   		var list = [];
   		var unitTypes = this.get('unitTypes');
   		var self = this;
   		
   		unitTypes.forEach(function(unitType) {
   			if(unitType.garrisonUnits > 0 || unitType.otherUnits > 0)
   			{
   			//infantry
   				if(unitType.unitCategory == self.get("unityTypeID"))
   					list.push(unitType);
   			}
      });
      
      	return list;
   		}.property('garrisonArmy.details.@each', 'otherArmy.details.@each', 'unitTypesChange').cacheable(),
   });
   
   module.ArmyChangeArtilleryView  = module.ArmyChangeInfantryView.extend ({
   
   		templateName: 'army-new-change-tab2-view',
   		unityTypeID: 2,
   });
   
   module.ArmyChangeCavalryView  = module.ArmyChangeInfantryView.extend ({
   
   		templateName: 'army-new-change-tab3-view',
   		unityTypeID: 1,
   });
  
  return module;
    
}(AWE.UI.Ember || {}));