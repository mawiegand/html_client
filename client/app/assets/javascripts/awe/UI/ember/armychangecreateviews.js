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
    isCreateArmy: false,

    changePressed: function() {
      log('ERROR Action not connected: changeWasPressed.');
    },

    otherArmyObserver: function() {
      if (this.get('otherArmy')) {
        AWE.GS.ArmyManager.updateArmy(this.get('otherArmy').getId(), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('otherArmy'),
    
    otherArmySizeMaxBinding: 'otherArmy.size_max',

    garrisonArmyObserver: function() {
      if (this.get('garrisonArmy')) {
        AWE.GS.ArmyManager.updateArmy(this.get('garrisonArmy').getId(), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('garrisonArmy'),

    unitTypesChange: null,

    garrisonSum: function(){
      var sum = 0;
      (this.get('unitTypes') || []).forEach(function(unitType){
        sum += parseInt(unitType.get('garrisonUnits'));
      });
      return sum;
    }.property('unitTypes.@each.garrisonUnits').cacheable(),
    
    otherSum: function(){
      var sum = 0;
      (this.get('unitTypes') || []).forEach(function(unitType){
        sum += parseInt(unitType.get('otherUnits'));
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
      (this.get('unitTypes') || []).forEach(function(unitType){
        unitType.set('garrisonUnits', unitType.get('allUnits'));
        unitType.set('otherUnits', 0);
      });
    },
    
    allToOther: function() {
      (this.get('unitTypes') || []).forEach(function(unitType){
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
    //garrison and other army types
    unitTypes: function() {
     
      var list = [];
      var garrisonDetails = this.getPath('garrisonArmy.details');
      var otherDetails = this.getPath('otherArmy.details');
      var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types');
      //debugger
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
              unitID: unitType.id,
            }));

          }
       });
      }
      // log("LIST", list, details);
      return list;
    }.property('garrisonArmy', 'otherArmy', 'garrisonArmy.details.@each', 'otherArmy.details.@each', 'unitTypesChange').cacheable(),
    
    unitDifferences: function() {
      var unitDifferences = {};
      var unitTypes = this.get('unitTypes') || [];
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
  

//create dialog from change dialog
  module.ArmyNewCreateDialog = module.ArmyNewChangeDialog.extend({
    templateName: 'army-new-create-dialog',

    locationId: null,
    garrisonArmy: null,
    isCreateArmy: true,

    init: function() {
      var self = this;
      this._super();
      this.set('loadingSettlement', true);
      AWE.GS.SettlementManager.updateSettlementsAtLocation(this.get('locationId'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(settlements) {
        self.set('loadingSettlement', false);
      });
    },
    
    loadingSettlement: false,
      
    settlement: function() {
      return AWE.GS.SettlementManager.getSettlementAtLocation(this.get('locationId'))
    }.property('hashableSettlements.changedAt').cacheable(),
    
    remainingArmies: function() {
      var commandPoints = (this.getPath('settlement.command_points') || 0);
      var armiesCount   = (this.getPath('settlement.armies_count') || 0) - 1;    // without garrison army
      return commandPoints > armiesCount ? commandPoints - armiesCount : 0;
    }.property('settlement.command_points', 'settlement.armies_count').cacheable(),
    
    hashableSettlements: function() {
      var locationId = this.get('locationId');
      // log('---> hashableSettlements', AWE.GS.SettlementAccess.getHashableCollectionForLocation_id(locationId));
      return AWE.GS.SettlementAccess.getHashableCollectionForLocation_id(locationId);
    }.property('locationId').cacheable(),

    //only garrison types
    unitTypes: function() {
      var list = [];
      var garrisonDetails = this.getPath('garrisonArmy.details');
      var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types');
      
      if (garrisonDetails) { log('build list')
        AWE.Ext.applyFunction(unitTypes, function(unitType) {
          if ((garrisonDetails[unitType.db_field] !== undefined && garrisonDetails[unitType.db_field] > 0)) {
            list.push(Ember.Object.create({
              name: unitType.name,
              symbolic_id: unitType.db_field, 
              allUnits: garrisonDetails[unitType.db_field] + 0,
              garrisonUnits: garrisonDetails[unitType.db_field],
              otherUnits: 0,
              unitCategory: unitType.category,
              unitAttack: unitType.attack,
              unitID: unitType.id,
            }));

          }
       });
      }
      // log("LIST", list, details);
      return list;
    }.property('garrisonArmy', 'garrisonArmy.details.@each', 'otherArmy.details.@each', 'unitTypesChange').cacheable(),

    //other units for new army
    unitQuantities: function() {
      var unitQuantities = {};
      var unitTypes = this.get('unitTypes') || [];
      unitTypes.forEach(function(unitType) {
        var quantity = unitType.get('otherUnits');
        if (quantity > 0) {
          unitQuantities[unitType.get('symbolic_id')] = quantity; 
        }
      });
      return unitQuantities;
    },
    
    otherArmySizeMaxBinding: 'settlement.army_size_max',    
    
    armyName: 'New Army',

    changePressed: function() {
      log('ERROR Action not connected: changeWasPressed.');
    },

    trainingButtonUIMarker: function() {
      var unitTypes = this.get('unitTypes') || [];
      var currentUnits = 0;

      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var infantryCategoryId = rules.getUnitCategoryNumId("unitcategory_infantry");
      }

      unitTypes.forEach(function(unitType) 
      {
          if(unitType.get('unitCategory') === infantryCategoryId)//infantry
          {
            currentUnits += parseInt(unitType.get('otherUnits'));
          }
      });

      if(currentUnits == 0)
      {
        var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
        return tutorialState.isUIMarkerActive(AWE.GS.MARK_CREATE_ARMY_DIALOG_FLOW) ;
      }
      return false;
    }.property('unitTypes.@each.otherUnits','AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

    createButtonUIMarker: function() {
      var unitTypes = this.get('unitTypes') || [];
      var currentUnits = 0;

      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var infantryCategoryId = rules.getUnitCategoryNumId("unitcategory_infantry");
      }


      unitTypes.forEach(function(unitType) 
      {
        if(unitType.get('unitCategory') == infantryCategoryId)//infantry
        {
          currentUnits += parseInt(unitType.get('otherUnits'));
        }
      });

      if(currentUnits > 0)
      {
        var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
        return tutorialState.isUIMarkerActive(AWE.GS.MARK_CREATE_ARMY_DIALOG_FLOW) ;
      }
      return false;
    }.property('unitTypes.@each.otherUnits','AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

  });
  
  module.ArmyNameTextfield = Ember.TextField.extend({
    //classNames: ["create-army-dialog-name"],
  });

  module.ArmyAbstractView  = Ember.View.extend ({

    locationId: null,
    garrisonArmy: null,
  });
  
  module.ArmyNewChangeView = module.ArmyAbstractView.extend ({
    templateName: 'army-new-change-content-view',
	  unitTypes: null,
	  garrisonArmy: null,
    otherArmy: null,
    isCreateArmy: true,

    infatry_strength: function(){
      var infatry_strength_total = 0;
      var unitTypes = this.get('unitTypes') || [];
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var infantryCategoryId = rules.getUnitCategoryNumId("unitcategory_infantry");
      }

      unitTypes.forEach(function(unitType) 
      {
        if(unitType.get('unitCategory') == infantryCategoryId)//infantry
        {
          infatry_strength_total += parseInt(unitType.get('unitAttack'))*parseInt(unitType.get('otherUnits'));
        }
      });
      return infatry_strength_total;
    }.property('unitTypes.@each.otherUnits').cacheable(),

    cavalry_strength: function(){
      var cavalry_strength_total = 0;
      var unitTypes = this.get('unitTypes') || [];
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var cavaleryCategoryId = rules.getUnitCategoryNumId("unitcategory_cavalry");
      }

      unitTypes.forEach(function(unitType) 
      {
        if(unitType.get('unitCategory') == cavaleryCategoryId)//cavalery
        {
          cavalry_strength_total += parseInt(unitType.get('unitAttack'))*parseInt(unitType.get('otherUnits'));
        }
      });
      return cavalry_strength_total;
    }.property('unitTypes.@each.otherUnits').cacheable(),

    archer_strength: function(){
      var archer_strength_total = 0;
      var unitTypes = this.get('unitTypes') || [];
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var artilleryCategoryId = rules.getUnitCategoryNumId("unitcategory_artillery");
      }

      unitTypes.forEach(function(unitType) 
      {
        if(unitType.get('unitCategory') == artilleryCategoryId)//artillery
        {
          archer_strength_total += parseInt(unitType.get('unitAttack'))*parseInt(unitType.get('otherUnits'));
        }
      });
      return archer_strength_total;
    }.property('unitTypes.@each.otherUnits').cacheable(),


    total_army_strength: function(){
      var infatry_strength_total = 0;
      var unitTypes = this.get('unitTypes') || [];
      unitTypes.forEach(function(unitType) 
      {
         infatry_strength_total += unitType.get('unitAttack')*unitType.get('otherUnits');
      });
        return infatry_strength_total;
    }.property('unitTypes.@each.otherUnits').cacheable(),

    totalArmyUnits: function()
    {
      var total = 0;
      var unitTypes = this.get('unitTypes') || [];
      unitTypes.forEach(function(unitType) 
      {
         total += parseInt(unitType.get('otherUnits'));
      });
        return total;
    }.property('unitTypes.@each.otherUnits').cacheable(),
    

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
 
module.SliderView = Ember.View.extend({
  templateName: "slider-view",
  classNames: ["slider-view"],
  max: 1,
  min: 0,
  value: null,

  onPlusClicked: function(){
    if(this.get("value") < this.get("max"))
    {
      this.set("value", (parseInt(this.get("value")) + 1))
    }
  },

  onMinusClicked: function(){
    if(this.get("value") > 0)
    {
      this.set("value", (this.get("value") - 1))
    }
  },

});

module.RangeView = Ember.TextField.extend({
  classNames: ["slider-range"],
  min: 0,
  max: 1,
  value: null,

  attributeBindings: ["min", "max"],
  type: "range",
});

module.ArmyRangeView  = Ember.TextField.extend({

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
      var value = this.getPath("unitType.allUnits") - parseInt(this.get("value"));
      var other = parseInt(this.get("value"));
      this.setPath('unitType.garrisonUnits', value);
      this.setPath('unitType.otherUnits', other);
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
    unityTypeSymbolicID: "unitcategory_infantry",
    //return all units if needed
    isAllUnits: false,

   	activeArmyTypen: function()
   	{

   		var list = [];
   		var unitTypes = this.get('unitTypes') || [];
   		var self = this;
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var specialCategoryId = rules.getUnitCategoryNumId("unitcategory_special");
        var infantryCategoryId = rules.getUnitCategoryNumId("unitcategory_infantry");
      }

   		unitTypes.forEach(function(unitType) {
       
   			if(unitType.garrisonUnits > 0 || unitType.otherUnits > 0)
   			{
   			//infantry and special unit
   			  if(unitType.unitCategory === rules.getUnitCategoryNumId(self.get("unityTypeSymbolicID")) || self.get('isAllUnits'))
          {
   					  list.push(unitType);
          }
          else
          {
            if((unitType.unitCategory == specialCategoryId) && (rules.getUnitCategoryNumId(self.get("unityTypeSymbolicID")) === infantryCategoryId))
            {
              list.push(unitType);
            }
          }
   			}
      });
      
      	return list;
      //removed, while activeArmyTypen should updated after unitTypes computed
   		}.property('unitTypes.@each').cacheable(),
   });
   
   module.ArmyChangeArtilleryView  = module.ArmyChangeInfantryView.extend ({
   
   		templateName: 'army-new-change-tab2-view',
   		unityTypeSymbolicID: "unitcategory_artillery",
   });
   
   module.ArmyChangeCavalryView  = module.ArmyChangeInfantryView.extend ({
   
   		templateName: 'army-new-change-tab3-view',
   		unityTypeSymbolicID: "unitcategory_cavalry",
   });

  //view to take click from unit icon
   module.ArmyUnitInfoView  = Ember.View.extend ({
      templateName: 'unit-info-click',
      unitType: null,
      openDialog: function()
      {
        var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types') || [];
        var unitTypeLocalObject = this.get("unitType");
        var id = this.getPath("unitType.unitID");

        unitTypes.forEach(function(rulesUnitType) 
        {
          if(rulesUnitType.id == id)//cavalery
            {
              var dialog = AWE.UI.Ember.EncyclopediaUnitNewView.create({unit: rulesUnitType});
              WACKADOO.presentModalDialog(dialog);
              return false;
            }
        });
        return false; // prevent default behavior
      },

   });
  
  return module;
    
}(AWE.UI.Ember || {}));