/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.EncyclopediaBuildingView = Ember.View.extend({
    building: null,

    commandPoints: function() {
      return this.getPath('building.abilities.command_points') !== undefined && this.getPath('building.abilities.command_points') !== null && this.getPath('building.abilities.command_points').length > 0;
    }.property('building.abilities.command_points').cacheable(),
    
    production: function() {
      return this.getPath('building.production') !== undefined && this.getPath('building.production') !== null && this.getPath('building.production').length > 0;
    }.property('building.production').cacheable(),
  
    experienceProduction: function() {
      return this.getPath('building.experience_production') !== undefined && this.getPath('building.experience_production') !== null && this.getPath('building.experience_production').length > 0;
    }.property('building.experience_production').cacheable(),
  
    capacity: function() {
      return this.getPath('building.capacity') !== undefined && this.getPath('building.capacity') !== null && this.getPath('building.capacity').length > 0;
    }.property('building.capacity').cacheable(),  

    tradingCarts: function() {
      return this.getPath('building.abilities.trading_carts') !== undefined && this.getPath('building.abilities.trading_carts') !== null && this.getPath('building.abilities.trading_carts').length > 0;
    }.property('building.abilities.trading_carts').cacheable(),
  
    stats: function() {
      var building = this.get('building');
      
      if (building === undefined || building === null) {
        return null;
      }
      var stats = [];
      var maxLevel = (this.getPath('building.category') == 4 || this.getPath('building.category') == 5) ? 20 : 10; // depends on the category; only large and small buildings can reach level 20
      for (var level=1; level <= maxLevel; level++) {
        stats.push({
          level: level,
          population:             AWE.GS.Util.parseAndEval(building.population, level),
          costs:                  AWE.Util.Rules.evaluateResourceCosts(building.costs, level, 0, true),
          productionTime:         AWE.GS.Util.parseAndEval(building.production_time, level),
          capacities:             this.get('capacity')             ? AWE.Util.Rules.evaluateResourceCapacity(building.capacity, level, false)     : null,
          productions:            this.get('production')           ? AWE.Util.Rules.evaluateResourceProduction(building.production, level, false) : null,
          experienceProductions:  this.get('experienceProduction') ? AWE.GS.Util.parseAndEval(building.experience_production, level)              : null,
          commandPoints:          this.get('commandPoints')        ? AWE.GS.Util.parseAndEval(building.abilities.command_points, level)           : null,
          tradingCarts:           this.get('tradingCarts')         ? AWE.GS.Util.parseAndEval(building.abilities.trading_carts, level)            : null,
        });
      };
      return stats;
    }.property('building', 'capacity', 'production', 'experienceProduction').cacheable(),

    buildingRequirements: function() {
      var building = this.get('building');
      if (building === undefined || building === null) {
        return null;
      }

      if(building.requirementGroups === undefined || building.requirementGroups === null) {
        return null;
      }

      var requirements = building.requirementGroups[0];
      var requirementsWithNames = [];

      if(requirements === undefined || requirements === null) {
        return requirementsWithNames;
      }

      requirements.forEach(function(item) {
        if(item.min_level > 0) {
          requirementsWithNames.push({
            name: AWE.GS.RulesManager.getRules().getBuildingTypeWithSymbolicId(item.symbolic_id).name[AWE.Settings.locale],
            level: item.min_level
          });
        }
      });

      return requirementsWithNames;
    }.property('building.buildingType', 'building.slot.settlement.hashableSlots.collection@each.level', 'building.slot.settlement.hashableSlots.changedAt'),

    requirementsMet: function() {
      var buildingRequirements = this.get('buildingRequirements');
      return !buildingRequirements || buildingRequirements.length === 0;
    }.property('buildingRequirements', 'buildingRequirements.length'),

    buildingCategory: function() {
      var building = this.get('building');
      if (building === undefined || building === null) {
        return null;
      }
      return AWE.GS.RulesManager.getRules().getBuildingCategory(building.category).name[AWE.Settings.locale];
    }.property('building').cacheable(),

    buildingTypeString: function() {
      var building = this.get('building');
      if (building === undefined || building === null) {
        return null;
      }
      
      switch(building.category) {
        case 4:
          return AWE.I18n.lookupTranslation('encyclopedia.largeBuilding');
          break;
        case 5:
          return AWE.I18n.lookupTranslation('encyclopedia.smallBuilding');
          break;
        case 6:
          return AWE.I18n.lookupTranslation('encyclopedia.specialBuilding');
          break;
        default:
          return AWE.I18n.lookupTranslation('encyclopedia.fortressBuilding');
      }
    }.property('building').cacheable(),

  });

  module.EncyclopediaUnitNewView = module.PopUpDialog.extend({
    templateName: 'encyclopedia-unit-new',
    classNames: ['encyclopedia-unit-new'],   
  }); 

  module.EncyclopediaUnitView = Ember.View.extend({
    unit: null,
    
    categoryClass: function() {
      var unit = this.get('unit');
      return unit ? "uc-"+unit.category : null;
    }.property('unit.category').cacheable(),

    experienceForLostUnits: function() {
      var costs = this.getPath('unit.costs');
      var sum = 0;
      AWE.Ext.applyFunctionToElements(costs, function(cost) {
        sum += parseInt(cost);
      });
      return Math.floor(Math.floor(sum * 0.08) * this.getPath('unit.experience_factor'));
    }.property('unit').cacheable(),
    
    unitButtonClicked: function() {
      var unit = this.get("unit");
      var dialog = AWE.UI.Ember.EncyclopediaUnitNewView.create({unit: unit});
      WACKADOO.presentModalDialog(dialog);
      return false; // prevent default behavior
    },
  });  


  module.ResourceButton = Ember.View.extend({
    classNames: ['enc-button'],
    resourceType: null,
    click: function(event) {
      var resourceType = this.get('resourceType');
      this.get('parentView').set('selected', resourceType);
      this.get('parentView').set('selectedType', 'resource');
    },
  });  

  module.BuildingButton = Ember.View.extend({
    classNames: ['enc-button'],
    buildingType: null,
    click: function(event) {
      var buildingType = this.get('buildingType');
      this.get('parentView').set('selected', buildingType);
      this.get('parentView').set('selectedType', 'building');
    },
  }); 
  
  module.UnitButton = Ember.View.extend({
    classNames: ['enc-button'],
    unitType: null,
    click: function(event) {
      var unitType = this.get('unitType');
      this.get('parentView').set('selected', unitType);
      this.get('parentView').set('selectedType', 'unit');
    },
  }); 


  module.EncyclopediaView = module.InfoDialog.extend({
    templateName: 'encyclopedia-view',

    rules:            null,
    selected:         null,
    selectedType:     null,
    
    displayResources: false,
    displayBuildings: false,
    displayUnits:     false,

    encyclopediaViewClass: function() {
      if (AWE.Facebook.isRunningInCanvas) {
        return 'encyclopedia-view-scrollable';
      }
      else {
        return '';
      }
    }.property(),
    
    resourceTypes: function () {
      var rules = this.get('rules');
      return rules ? rules.get('resource_types') : null;
    }.property('rules').cacheable(),
    
    selectedResource: function() {
      return this.get('selectedType') === 'resource';
    }.property('selectedType').cacheable(),
    
    toggleResources: function() {
      this.set('displayResources', !this.get('displayResources'));
    },
    
    buildingTypes: function () {
      var buildingTypes = this.getPath('rules.building_types');
      if (buildingTypes == null) {
        return null;
      }

      var divineSupporter = AWE.GS.game.getPath('currentCharacter.divine_supporter');
      return buildingTypes.filter(function(buildingType) {
        return !buildingType.divine_supporters_only || divineSupporter;
      });
    }.property('rules').cacheable(),
    
    selectedBuilding: function() {
      return this.get('selectedType') === 'building';
    }.property('selectedType').cacheable(),
    
    toggleBuildings: function() {
      this.set('displayBuildings', !this.get('displayBuildings'));
    },
    
    
    unitTypes: function () {
      var rules = this.get('rules');
      return rules ? rules.get('unit_types') : null;
    }.property('rules').cacheable(),
    
    selectedUnit: function() {
      return this.get('selectedType') === 'unit';
    }.property('selectedType').cacheable(),
    
    toggleUnits: function() {
      this.set('displayUnits', !this.get('displayUnits'));
    },    
        
    
    
    init: function() {
      this._super();
      this.set('rules', AWE.GS.RulesManager.getRules());
    },
  });  
  
  return module;  
    
}(AWE.UI.Ember || {}));
