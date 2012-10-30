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
  
    capacity: function() {
      return this.getPath('building.capacity') !== undefined && this.getPath('building.capacity') !== null && this.getPath('building.capacity').length > 0;
    }.property('building.capacity').cacheable(),  
  
    stats: function() {
      var building = this.get('building');
      if (building === undefined || building === null) {
        return null;
      }
      var stats = [];
      for (var level=1; level <= 20; level++) {
        stats.push({
          level: level,
          population:     AWE.GS.Util.parseAndEval(building.population, level),
          costs:          AWE.Util.Rules.evaluateResourceCosts(building.costs, level, 0, true),
          productionTime: AWE.GS.Util.parseAndEval(building.production_time, level),
          capacities:     this.get('capacity') ? AWE.Util.Rules.evaluateResourceCapacity(building.capacity, level, false) : null,
          productions:    this.get('production') ? AWE.Util.Rules.evaluateResourceProduction(building.production, level, false) : null,
          commandPoints:  this.get('commandPoints') ? AWE.GS.Util.evalFormula(AWE.GS.Util.parseFormula(building.abilities.command_points), level) : null,
        })
      };
      return stats;
    }.property('building', 'capacity', 'production').cacheable(),
    
  });  

  module.EncyclopediaUnitView = Ember.View.extend({
    unit: null,
    
    categoryClass: function() {
      var unit = this.get('unit');
      return unit ? "uc-"+unit.category : null;
    }.property('unit.category').cacheable(),
    
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
      var rules = this.get('rules');
      return rules ? rules.get('building_types') : null;
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