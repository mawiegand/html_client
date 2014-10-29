var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.UpgradeView = module.PopUpDialog.extend({
    templateName: 'upgrade-view',
    slot: null,
    controller: null,
    stepsFurther: 0,

    building: function() {
      return this.getPath("slot.building");
    }.property("slot.building"),

    currentBuildingClass: function() {
      var className = AWE.GS.RulesManager.getRules().building_types[this.getPath("building.buildingId")].symbolic_id;
      return className;
    }.property("building.buildingId"),

    selectedBuildingClass: function() {
      var className = AWE.GS.RulesManager.getRules().building_types[this.getPath("building.buildingId")].symbolic_id;
      return className;
    }.property("building.buildingId"),

    currentBuildingImageLevel: function() {
      var imageLevel = AWE.Config.BuildingImageLibrary.getImageLevelForBuilding(this.get("currentBuildingClass"), this.get("currentLevel"));
      return "level" + imageLevel;
    }.property("currentLevel"),

    selectedBuildingImageLevel: function() {
      var imageLevel = AWE.Config.BuildingImageLibrary.getImageLevelForBuilding(this.get("currentBuildingClass"), this.get("selectedLevel"));
      return "level" + imageLevel;
    }.property("selectedLevel"),

    currentLevel: function() {
      return this.getPath("slot.building.levelAfterJobs");
    }.property("slot.building.levelAfterJobs"),

    selectedLevel: function() {
      if(this.get("currentLevel") !== this.get("slot").slotType().max_level) {
        return this.get("currentLevel") + 1 + this.get("stepsFurther");
      }
      return this.get("currentLevel");
    }.property("stepsFurther", "currentLevel"),

    isMinimumSelected: function() {
      return this.get("stepsFurther") === 0;
    }.property("stepsFurther"),

    isMaximumSelected: function() {
      return this.get("selectedLevel") === this.get("slot").slotType().max_level;
    }.property("selectedLevel"),



// == Building Details ==
    currentProductions: function() {
      return this.get("building").getProductionsForLevel(this.get("currentLevel"));
    }.property("building.productions"),

    selectedProductions: function() {
      return this.get("building").getProductionsForLevel(this.get("selectedLevel"));
    }.property("building", "selectedLevel"),

    currentCapacity: function() {
      return this.get("building").getCapacityForLevel(this.get("currentLevel"));
    }.property("building.capacity"),

    selectedCapacity: function() {
      return this.get("building").getCapacityForLevel(this.get("selectedLevel"));
    }.property("building", "selectedLevel"),

    currentPopulation: function() {
      if(this.get("currentProductions").length > 3) {
        return false;
      }
      return this.get("building").getPopulationForLevel(this.get("currentLevel"));
    }.property("building.population"),

    selectedPopulation: function() {
      if(this.get("selectedProductions").length > 3) {
        return false;
      }
      return this.get("building").getPopulationForLevel(this.get("selectedLevel"));
    }.property("building", "selectedLevel"),

    currentProductionBoni: function() {
      return this.get("building").getProductionBoniForLevel(this.get("currentLevel"));
    }.property("building.productionBoni"),

    selectedProductionBoni: function() {
      return this.get("building").getProductionBoniForLevel(this.get("selectedLevel"));
    }.property("building", "selectedLevel"),

// == End ==


    upgradeCosts: function() {
      return this.getPath("building.costsOfNextLevel");
    }.property("building.costsOfNextLevel"),

    upgradePressed: function() {
      this.get('controller').constructionUpgradeClicked(this.get('slot'));
      WACKADOO.closeAllModalDialogs();
    },

    increaseStepsFurther: function() {
      var currentStepsFurther = this.get("stepsFurther");
      this.set("stepsFurther", currentStepsFurther + 1);
    },

    decreaseStepsFurther: function() {
      var currentStepsFurther = this.get("stepsFurther");
      this.set("stepsFurther", currentStepsFurther - 1);
    },

  });

  module.ResourceCostsView = Ember.View.extend({
    templateName: 'upgrade-resource',
    resource: null,

    resourceName: function() {
      return this.getPath("resource.resourceType.symbolic_id");
    }.property("resource.resourceType.symbolic_id"),

    resourceAmount: function() {
      return this.getPath("resource.amount");
    }.property("resource.amount"),

  });

  module.ResourceProductionView = Ember.View.extend({
    templateName: 'production-resource',
    production: null,

    resourceName: function() {
      return this.getPath("production.resourceType.symbolic_id");
    }.property("production.resourceType.symbolic_id"),

    productionRate: function() {
      return this.getPath("production.baseProduction");
    }.property("production.baseProduction"),

  });

  module.ResourceCapacityView = Ember.View.extend({
    templateName: 'capacity-resource',
    capacity: null,

    resourceName: function() {
      return this.getPath("capacity.resourceType.symbolic_id");
    }.property("capacity.resourceType.symbolic_id"),

    capacitySize: function() {
      return this.getPath("capacity.capacity");
    }.property("capacity"),

  });

  module.ResourceBonusView = Ember.View.extend({
    templateName: 'bonus-resource',
    bonus: null,

    resourceName: function() {
      return this.getPath("bonus.resourceType.symbolic_id");
    }.property("bonus.resourceType.symbolic_id"),

    bonusSize: function() {
      if(this.getPath("bonus.bonus") > 0)
      {
        return this.getPath("bonus.bonus");
      }
      return false;
    }.property("bonus"),

  });

  return module;
}(AWE.UI.Ember || {}));