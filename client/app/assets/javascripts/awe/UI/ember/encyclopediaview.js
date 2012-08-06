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
    
    stats: function() {
      var building = this.get('building');
      if (building === undefined || building === null) {
        return null;
      }
      var stats = [];
      for (var level=1; level <= 20; level++) {
        stats.push({
          level: level,
          population: AWE.GS.Util.parseAndEval(building.population, level),
          costs: AWE.Util.Rules.evaluateResourceCosts(building.costs, level, 0, true),
        })
      };
      return stats;
    }.property('building').cacheable(),
    
  });  

  module.ResourceButton = Ember.View.extend({
    resourceType: null,
    click: function(event) {
      var resourceType = this.get('resourceType');
      this.get('parentView').set('selected', resourceType);
      this.get('parentView').set('selectedType', 'resource');
    },
  });  

  module.BuildingButton = Ember.View.extend({
    buildingType: null,
    click: function(event) {
      var buildingType = this.get('buildingType');
      this.get('parentView').set('selected', buildingType);
      this.get('parentView').set('selectedType', 'building');
    },
  }); 
  
  module.UnitButton = Ember.View.extend({
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