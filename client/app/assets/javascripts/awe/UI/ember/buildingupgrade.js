var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

  module.UpgradeView = module.PopUpDialog.extend({
    templateName: 'upgrade-view',
    slot: null,
    controller: null,
    stepsFurther: 0,
    smallDetailTemplate: true,
    conversionView: false,

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
      return "size" + imageLevel;
    }.property("currentLevel"),

    selectedBuildingImageLevel: function() {
      var imageLevel = AWE.Config.BuildingImageLibrary.getImageLevelForBuilding(this.get("currentBuildingClass"), this.get("selectedLevel"));
      return "size" + imageLevel;
    }.property("selectedLevel"),

    currentLevel: function() {
      return this.getPath("slot.building.levelAfterJobs");
    }.property("slot.building.levelAfterJobs"),

    selectedLevel: function() {
      if(this.get("conversionView"))
      {
        return this.getPath("building.converted.level");
      }
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

    upgradeCosts: function() {
      if(this.get("conversionView"))
      {
        return this.getPath("building.conversionCosts");
      }
      return this.getPath("building.costsOfNextLevel");
    }.property("building"),

    upgradePressed: function() {
      if(this.get("conversionView"))
      {
        this.get('controller').constructionConvertClicked(this.get('slot'));
      }
      else
      {
        this.get('controller').constructionUpgradeClicked(this.get('slot'));
      }
      this.destroy();
    },

    increaseStepsFurther: function() {
      var currentStepsFurther = this.get("stepsFurther");
      this.set("stepsFurther", currentStepsFurther + 1);
    },

    decreaseStepsFurther: function() {
      var currentStepsFurther = this.get("stepsFurther");
      this.set("stepsFurther", currentStepsFurther - 1);
    },

    isTutorialUpgradeButton: function(){
        var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
        return tutorialState.isUIMarkerActive(AWE.GS.MARK_UPGRADE_BUTTON) ;
      }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

  });

  module.BuildingDetailsView = Ember.View.extend({
    templateName: 'building-details-view',
    classNames: ['building-details'],
    classBinding: "smallTemplate",
    building: null,
    level: 1,
    smallTemplate: false,
    conversion: false,

    buildingProductions: function() {
      if(this.get("buildingResourceProductions") || this.get("buildingExperienceProductions"))
      {
        return true;
      }
      return false;
    }.property("buildingResourceProductions", "buildingExperienceProduction"),

    buildingResourceProductions: function() {
      var productions = this.get("building").getProductionsForLevel(this.get("level"));
      if(productions.length > 0)
      {
        return productions;
      }
      return false;
    }.property("building", "level"),

    buildingExperienceProductions: function() {
      var productions = this.get("building").getExperienceProductionForLevel(this.get("level"));
      return productions;
    }.property("building", "level"),

    buildingCapacity: function() {
      var capacity = this.get("building").getCapacityForLevel(this.get("level"));
      if(capacity)
      {
        return capacity;
      }
      return false;
    }.property("building", "level"),

    buildingPopulation: function() {
      var population = this.get("building").getPopulationForLevel(this.get("level"));
      if(population)
      {
        return population;
      }
      return false;
    }.property("building", "level"),

    buildingProductionBoni: function() {
      var boni = this.get("building").getProductionBoniForLevel(this.get("level"));
      if(boni.length > 0)
      {
        return boni;
      }
      return false;
    }.property("building", "level"),

    buildingMilitarySpeedupQueues: function() {
      var returnQueues = [];
      var queues = this.get("building").calculateSpeedupQueues(this.get("level"));
      queues.forEach(function(queue) {
        if(queue.queueType.symbolic_id !== "queue_buildings")
        {
          returnQueues.push(queue);
        }
      });
      if(returnQueues.length > 0)
      {
        return returnQueues;
      }
      return false;
    }.property("building", "level"),

    buildingConstructionSpeedupQueue: function() {
      var returnQueue;
      var queues = this.get("building").calculateSpeedupQueues(this.get("level"));
      queues.forEach(function(queue) {
        if(queue.queueType.symbolic_id === "queue_buildings")
        {
          returnQueue = queue;
        }
      });
      if(returnQueue)
      {
        return returnQueue;
      }
      return false;
    }.property("building", "level"),

    buildingTradeCarts: function() {
      var carts = this.get("building").calcTradingCarts(this.get("level"));
      return carts;
    }.property("building", "level"),

    buildingGarrisonBonus: function() {
      var bonus = this.get('building').getGarrisonBonusForLevel(this.get('level'));
      return bonus;
    }.property("building", "level"),

    buildingArmyBonus: function() {
      var bonus = this.get('building').getArmyBonusForLevel(this.get('level'));
      return bonus;
    }.property("building", "level"),

    buildingDefenseBonus: function() {
      var bonus = 100 * this.get('building').getDefenseBonusForLevel(this.get('level'));
      return bonus;
    }.property("building", "level"),

    containsMilitaryInfo: function() {
      if(this.get("buildingMilitarySpeedupQueues") || this.get("buildingGarrisonBonus") || this.get("buildingArmyBonus") || this.get("buildingDefenseBonus"))
      {
        return true;
      }
      return false;
    }.property("buildingMilitarySpeedupQueues", "buildingGarrisonBonus", "buildingArmyBonus", "buildingDefenseBonus"),

    containsEconomyInfo: function() {
      if(this.get("buildingProductions") || this.get("buildingCapacity") || this.get("buildingConstructionSpeedupQueue") || this.get("buildingProductionBoni"))
      {
        return true;
      }
      return false;
    }.property("buildingProductions", "buildingProductionBoni", "buildingConstructionSpeedupQueue", "buildingCapacity"),


    isSingleMilitaryRow: function() {
      if(this.get("containsMilitaryInfo"))
      {
        if(this.get("containsEconomyInfo"))
        {
          return false;
        }
        return true;
      }
      return false;
    }.property("containsEconomyInfo", "containsMilitaryInfo"),

    isSingleEconomyRow: function() {
      if(this.get("containsEconomyInfo"))
      {
        if(this.get("containsMilitaryInfo"))
        {
          return false;
        }
        return true;
      }
      return false;
    }.property("containsEconomyInfo", "containsMilitaryInfo"),

  });

  module.BuildingUnlocksView = Ember.View.extend({
    templateName: 'building-unlocks-view',
    building: null,

    buildingUnlockAllianceCreation: function() {
      return this.getPath("building.unlockedAllianceCreation");
    }.property("building"),

    buildingUnlockDiplomacy: function() {
      return this.getPath("building.unlockDiplomacyNextLevel");
    }.property("building"),

  }); 

  module.BuildingRequirementsView = Ember.View.extend({
    templateName: 'building-requirements-view',
    classNames: ['building-requirements'],
    building: null,

    unmetRequirementGroups: function() {
      var groups = this.get("building").unmetRequirementGroups();
      return groups ? groups : false;
    }.property("building"),

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
      var symbolicId = this.getPath("capacity.resourceType.symbolic_id");
      if(symbolicId === "resource_cash")
      {
        return false;
      }
      return symbolicId; 
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

  module.UnitSpeedUpView = Ember.View.extend({
    templateName: 'unit-speedup',
    queue: null,

    unitName: function() {
      if(this.getPath("queue.queueType.symbolic_id") === "queue_building")
      {
        return false;
      }
      return this.getPath("queue.queueType.symbolic_id");
    }.property("bonus.resourceType.symbolic_id"),

    speedup: function() {
      if(this.getPath("queue.speedup") > 0)
      {
        return this.getPath("queue.speedup");
      }
      return false;
    }.property("bonus"),

  });

  return module;
}(AWE.UI.Ember || {}));