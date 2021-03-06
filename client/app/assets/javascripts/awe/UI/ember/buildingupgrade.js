
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

    isInTutorial: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      if(tutorialState.isUIMarkerActive(AWE.GS.MARK_UPGRADE_BUTTON)){
        return true;
      }
      return false;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

    building: function() {
      return this.getPath("slot.building");
    }.property("slot.building"),

    currentBuildingClass: function() {
      var className = AWE.GS.RulesManager.getRules().building_types[this.getPath("building.buildingId")].symbolic_id;
      return className;
    }.property("building.buildingId"),

    selectedBuildingClass: function() {
      var className = AWE.GS.RulesManager.getRules().building_types[this.getPath("building.buildingId")].symbolic_id;
      if(this.get("conversionView"))
      {
        className = AWE.GS.RulesManager.getRules().building_types[this.getPath("building.converted.buildingId")].symbolic_id;
      }
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

  module.UpgradeUnlockDialog = module.UpgradeView.extend({
    templateName: 'upgrade-unlock-dialog',

    levelDelta: function() {
      return this.get('selectedLevel') - this.get('currentLevel');
    }.property('selectedLevel', 'currentLevel'),

    unlocking: function() {
      if(this.get('unlockingBuildings').length > 0 || this.get('unlockingUnits').length > 0)
      {
        return true;
      }
      return false;
    }.property('unlockingBuildings', 'unlockingUnits'),

    unlockingBuildings: function() {
      return this.getPath('slot.building').getUnlockedBuildingsForLevel(this.get('selectedLevel'));
    }.property('slot.building.unlockedBuildings', 'selectedLevel'),

    unlockingUnits: function() {
      return this.getPath('slot.building').getUnlockedUnitsForLevel(this.get('selectedLevel'));
    }.property('slot.building.unlockedUnits', 'selectedLevel')
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

    buildingSingleCapacity: function() {
      var capacity = 0;
      this.get('buildingCapacity').forEach(function(cap) {
        if(capacity === 0)
        {
          capacity = cap.capacity;
        }
        if(cap.capacity !== capacity)
        {
          return false;
        }
      });
      return {capacity: capacity};
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

  module.BuildingDetailsUnlockView = Ember.View.extend({
    templateName: 'building-details-unlock-view',
    classNames: ['building-details-unlock'],
    classBinding: "smallTemplate",
    startBuilding: null,
    endBuilding: null,
    startLevel: 0,
    targetLevel: 1,
    smallTemplate: false,
    conversion: false,

    currentBuildingCapacity: function() {
      var capacity = this.get("startBuilding").getCapacityForLevel(this.get("startLevel"));
      if(capacity)
      {
        return capacity;
      }
      return false;
    }.property("startBuilding", "building.level"),

    targetBuildingCapacity: function() {

      var capacity = this.get("endBuilding").getCapacityForLevel(this.get("targetLevel"));
      if(capacity)
      {
        return capacity;
      }
      return false;
    }.property("endBuilding", "targetLevel"),

    currentBuildingSingleCapacity: function() {
      var capacity = 0;
      this.get('currentBuildingCapacity').forEach(function(cap) {
        if(capacity === 0)
        {
          capacity = cap.capacity;
        }
        if(cap.capacity !== capacity)
        {
          return false;
        }
      });
      return capacity;
    }.property("currentBuildingCapacity"),

    targetBuildingSingleCapacity: function() {
      var capacity = 0;
      this.get('targetBuildingCapacity').forEach(function(cap) {
        if(capacity === 0)
        {
          capacity = cap.capacity;
        }
        if(cap.capacity !== capacity)
        {
          return false;
        }
      });
      return capacity;
    }.property("targetBuildingCapacity"),

    capacityDelta: function() {
      return this.get('targetBuildingSingleCapacity') - this.get('currentBuildingSingleCapacity');
    }.property('currentBuildingSingleCapacity', 'targetBuildingSingleCapacity'),

    currentBuildingPopulation: function() {
      var population = this.get("startBuilding").getPopulationForLevel(this.get("startLevel"));
      if(population)
      {
        return population;
      }
      return false;
    }.property("startBuilding", "startLevel"),

    targetBuildingPopulation: function() {
      var population = this.get("endBuilding").getPopulationForLevel(this.get("targetLevel"));
      if(population)
      {
        return population;
      }
      return false;
    }.property("endBuilding", "targetLevel"),

    populationDelta: function() {
      return this.get('targetBuildingPopulation') - this.get('currentBuildingPopulation');
    }.property("currentBuildingPopulation", "targetBuildingPopulation"),

    commandPointsDelta: function() {
      return this.getPath('endBuilding').calcCommandPoints(this.get('targetLevel')) - this.get('startBuilding').calcCommandPoints(this.get('startLevel'));
    }.property("building.commandPoints", "building.commandPointsNextLevel"),


    buildingMilitarySpeedupQueues: function() {
      var returnQueues = [];
      var targetQueues = this.get("endBuilding").calculateSpeedupQueues(this.get("targetLevel"));
      var currentQueues = this.get("startBuilding").calculateSpeedupQueues(this.get("startLevel"));
      currentQueues.forEach(function(queue) {
        var correspondingTarget = null;
        targetQueues.forEach(function(targetQueue) {
          if(queue.queueType.id === targetQueue.queueType.id)
          {
            correspondingTarget = targetQueue;
            return;
          }
        });
        
        var delta = correspondingTarget.speedup - queue.speedup;
        if(queue.queueType.symbolic_id !== "queue_buildings")
        {
          returnQueues.push({
            queue: queue,
            delta: delta
          });
        }
      });
      if(returnQueues.length > 0)
      {
        return returnQueues;
      }
      return false;
    }.property("building", "startLevel", "targetLevel"),

    currentBuildingConstructionSpeedupQueue: function() {
      var returnQueue;
      var queues = this.get("startBuilding").calculateSpeedupQueues(this.get("startLevel"));
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
    }.property("building", "startLevel"),

    targetBuildingConstructionSpeedupQueue: function() {
      var returnQueue;
      var queues = this.get("endBuilding").calculateSpeedupQueues(this.get("targetLevel"));
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
    }.property("building", "targetLevel"),

    buildingSpeedDelta: function() {
      debugger
      return this.getPath('targetBuildingConstructionSpeedupQueue.speedup') - this.getPath('currentBuildingConstructionSpeedupQueue.speedup');
    }.property("targetBuildingConstructionSpeedupQueue", "currentBuildingConstructionSpeedupQueue"),

    buildingTradeCarts: function() {
      var carts = this.get("startBuilding").calcTradingCarts(this.get("level"));
      return carts;
    }.property("building", "level"),

    buildingGarrisonBonus: function() {
      var bonus = this.get('startBuilding').getGarrisonBonusForLevel(this.get('level'));
      return bonus;
    }.property("building", "level"),

    buildingArmyBonus: function() {
      var bonus = this.get('startBuilding').getArmyBonusForLevel(this.get('level'));
      return bonus;
    }.property("building", "level"),

    buildingDefenseBonus: function() {
      var bonus = 100 * this.get('startBuilding').getDefenseBonusForLevel(this.get('level'));
      return bonus;
    }.property("building", "level"),

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
      if(symbolicId)
      {
        return symbolicId;
      }
      return "unknown";
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