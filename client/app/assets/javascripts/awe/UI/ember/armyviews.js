/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {

module.ArmyInfoView = Ember.View.extend({
    templateName: "army-info-view",
    
    army: null,
    owner: null,
    
    displayHeading: true,
    
    ownerObserver: function() {
      var owner = AWE.GS.CharacterManager.getCharacter(this.getPath('army.owner_id'));
      var self = this;
      this.set('owner', owner);
      if (!owner) {
        AWE.GS.CharacterManager.updateCharacter(this.getPath('army.owner_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          self.set('owner', character);
        });
      }
    }.observes('army', 'army.owner_id'),

    displayUnits: function() {
      return !this.getPath('army.garrison') || this.get('isOwnArmy');
    }.property('garrison').cacheable(),
    
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
            list.push({ name: AWE.Util.Rules.lookupTranslation(unitType.name), number: army.details[unitType.db_field], unitType: unitType, unitID: unitType.id, symbolic_id: unitType.db_field }) ;
          }
        });
      }
      return list;
    }.property('army.details', 'army.details.@each').cacheable(),
    
    haveDetailsBinding: Ember.Binding.bool('army.details'),
    
    message: function() {
      var own = this.get('isOwnArmy');
      var advisor = this.get('advisor') || 'warrior';
      if (own === undefined || own === null) {
        return null; // return nothing, if value hasn't been computed so far.
      }
      return this.get('isOwnArmy') ? AWE.I18n.lookupTranslation('army.messages.own.'+advisor) : AWE.I18n.lookupTranslation('army.messages.other.'+advisor);
    }.property('isOwnArmy').cacheable(),
    
    nextAPTimeString: function() {
      var own  = this.get('isOwnArmy');
      var next = this.getPath('army.ap_next');
      return own && next ? AWE.Util.localizedTime(next) : null;
    }.property('isOwnArmy', 'ap_next'),
    
    advisor: function() {
      var category = this.getPath('army.armyCategory') || 'infantry';
      if (category === 'artillery') {
        return 'girl';
      }
      else if (category === 'cavalry') {
        return 'chef';
      }
      return 'warrior';
    }.property('army.armyCategory').cacheable(),
    
    locationName: function() {
      return this.getPath('army.location').settlement().get('name');
    }.property('army.location').cacheable(),
  });

//NEW DIALOGS START

//army info dialog
module.ArmyInfoNewDialog = module.PopUpDialog.extend({
  templateName: 'army-new-info-dialog',

  army: null,

  owner: null,

  ownerObserver: function() {
      var owner = AWE.GS.CharacterManager.getCharacter(this.getPath('army.owner_id'));
      var self = this;
      this.set('owner', owner);
      if (!owner) {
        AWE.GS.CharacterManager.updateCharacter(this.getPath('army.owner_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          self.set('owner', character);
        });
      }
    }.observes('army', 'army.owner_id'),

  hasSettings: function() {
      var army = this.get('army'); 
      return army ? army.isOwn() : false;
  }.property('owner'),

  settingsDialog: function() {
      var self = this;
      var input = this.getPath('army.name');
      var arguments = {
        input: input,
        inputMaxLength: 18       
      };
      var changeDialog = AWE.UI.Ember.InfoDialog.create({
        heading: AWE.I18n.lookupTranslation('settlement.customization.changeNameDialogCaption'), //Standart: "Info"
        contentTemplateName: 'text-input-info',
        arguments: arguments,
        controller: this,
        okText: AWE.I18n.lookupTranslation('general.change'),
        cancelText: AWE.I18n.lookupTranslation('general.cancel'),
        okPressed: function() {
          var action = AWE.Action.Military.createChangeArmyNameAction(self.get('army'), this.getPath('arguments.input'));
          var alert = this;
          AWE.Action.Manager.queueAction(action, function() { 
            alert.destroy();
          });  
        }, //Standart this.destroy
        cancelPressed: function() { this.destroy()} //Standart: null
      });
      WACKADOO.presentModalDialog(changeDialog);
      event.preventDefault();
  },

});

module.ArmyInfoNewView = module.ArmyInfoView.extend({
  templateName:   'army-new-info-view',
  homeSettlement: null,

  nameClicked: function() {
      var character = this.get('owner');
      var army = this.get('army');
      var characterId = character ? character.get('id') : (army ? army.get('owner_id') : null);
      if (!characterId) {
        return false;
      }
      var dialog = AWE.UI.Ember.CharacterInfoDialog.create({
        characterId: characterId,
      });
      WACKADOO.presentModalDialog(dialog);
      return false; // prevent default behavior
  },

  openAlliance: function() {
      var character = this.get('owner');
      if(!character)
        return false;

      var alliance = character.getAlliance();

      if(!alliance)
        return false;
      
      WACKADOO.showAllianceDialog(alliance.id);
    },

  homeSettlementClicked: function() {
    if(!this.getPath('army.npc'))
    {
      var settlement = this.get("homeSettlement");
      WACKADOO.presentScreenController.setSelectedSettlement(settlement);
      WACKADOO.presentScreenController.centerSettlement(settlement);
      WACKADOO.closeAllModalDialogs();
    }
  },

  isClickable: function() {
    if(!this.getPath("army.npc"))
    {
      return "clickable";
    }
  }.property("army.npc"),

    canRegenAp: function() {
      var currentAp = this.getPath("army.ap_present");
      var maxAp = this.getPath("army.ap_max");
      if(currentAp < maxAp)
      {
        return true;
      }
      return false;
    }.property("army.ap_present", "army.ap_max"),

    armyHomeBaseObserver: function() {
      var self = this;
      if(!self.getPath('army.npc') && !self.getPath('army.homeSettlement'))
      {
        AWE.GS.SettlementManager.updateSettlement(this.getPath('army.home_settlement_id'), module.ENTITY_UPDATE_TYPE_FULL, function(settlement) {
          self.set('homeSettlement', settlement)
        });
      }
      else if(!self.getPath('army.npc'))
      {
        self.set('homeSettlement', self.getPath('army.homeSettlement'));
      }
      else
      {
        var settlementName = AWE.I18n.lookupTranslation('army.details.neanderHome');
        var settlement = {
          name: settlementName
        }
        self.setPath('homeSettlement', settlement);
      }
    }.observes("army"),
});

//need custom tabs for military info
//tabs start
  module.TabArmyInfoView = module.TabViewNew.extend({
    templateName: 'tab-view-army-info',
    classNames:   'tab-view-army-info',

    cellClass: function(){
      return "cell-" + Math.round(100 / (this.get("tabViews").length - 1));
    }.property("tabViews"),
  });

  module.TabButtonArmyInfoView = module.TabButtonViewNew.extend({
    tagName: "div",
    classNames: ["tab-button-view-new"],
    isTitelTab: false
  });
//tab end
//military Recruitment dialog start
  module.MilitaryInfoDialogNew = module.ArmyNewCreateDialog.extend({
    templateName: 'military-new-info-dialog',

    //army: null,
    garrisonArmy: null,
    owner: null,

    displayHeading: true,
    
    settlement: null,

    startTab: 0,
    subTab: 0,

    garrisonArmyObserver: function() {
      if (this.get('garrisonArmy')) {
        AWE.GS.ArmyManager.updateArmy(this.get('garrisonArmy').getId(), module.ENTITY_UPDATE_TYPE_FULL);
      }
    }.observes('garrisonArmy'),

    trainingQueues: function() {
           return this.getPath('settlement.hashableTrainingQueues.collection');
    }.property('settlement', 'settlement.hashableTrainingQueues.changedAt').cacheable(),

    ownerObserver: function() {
      var owner = AWE.GS.CharacterManager.getCharacter(this.getPath('garrisonArmy.owner_id'));
      var self = this;
      this.set('owner', owner);
      if (!owner) {
        AWE.GS.CharacterManager.updateCharacter(this.getPath('garrisonArmy.owner_id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(character) {
          self.set('owner', character);
        });
      }
    }.observes('garrisonArmy', 'garrisonArmy.owner_id'),

    isInTutorial: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      if(tutorialState.isUIMarkerActive(AWE.GS.MARK_UNITS_BUTTON)){
        return true;
      }
      return false;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

  });

  module.GarrisonInfoView  = module.ArmyChangeInfantryView.extend ({
  templateName: 'army-info-tab1-view',

  isAllUnits: true,
  garrisonArmy: null,
  unitTypes: null,
});

module.InfantryInfoView  = Ember.View.extend ({
  templateName: 'army-info-tab2-view',

  garrisonArmy: null,
  unitCategory: "unitcategory_infantry",//category is 0, but queueID 2
  settlement: null,
  trainingQueues: null,
  controller: null,
  queue: null,


  isUIMarker: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_UNITS_BUTTON) ;
  }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

  setQueue: function(){
   var self = this;
   if(self.get('controller'))
   {
     self.get('controller').updateAllTrainingQueuesAndJobs();
   }
   var rules = AWE.GS.RulesManager.getRules();
   if (rules)
   {
     var unityCategoryId = rules.getUnitCategoryNumId(this.get('unitCategory'));
     var queueNumId = rules.getQueueTypeIdWithUnitCategory(unityCategoryId); 
   }
   var trainingQueuesCurrent = self.get('trainingQueues') || [];
   trainingQueuesCurrent.forEach(function(queueCurrent) {
       var queueType = queueCurrent.get('queueType');

       if(queueType.id === queueNumId)
       {
         self.set('queue', queueCurrent);
       }
     });
   }.observes('trainingQueues','trainingQueues.@each'),

 /* allUnitTypesForCategory: function()
  {
    var self = this;
    var units = [];
    var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types');

    AWE.Ext.applyFunction(unitTypes, function(unitType) {
        if(unitType.category == self.get('unitCategory') && unitType.id != 13)
        {
          //units[unitType.id] = unitType;
          units.push(Ember.Object.create({
              name: unitType.name,
              symbolic_id: unitType.db_field, 
              unitID: unitType.id,
            }));
        }
      });
    return units;
  }.property().cacheable(), */

  trainableUnitTypes: function() {
      var queueType = this.getPath('queue.queueType');
      var rules     = AWE.GS.RulesManager.getRules();
      if (!queueType || !queueType.produces) {
        return null;
      }
      var options = AWE.GS.RulesManager.getRules().getUnitTypesWithCategories(queueType.produces);
      var self = this;
      var result = options.filter(function(unitType) {
        return !self.impossibleToTrainDueToMaxRequirement(unitType);
      });
       
      return result && result.length > 0 ? result : null;
  }.property('queue.queueType').cacheable(),
    
    
  impossibleToTrainDueToMaxRequirement: function(unitType) {
      var settlement = this.getPath('queue.settlement');
      var character = settlement ? settlement.owner() : null;
      var reqGroups = unitType.requirementGroups || [];
      var maxFail = true;
      log('RECALC IMPOSSIBLE DUE TO MAX REQUIREMENT');
      reqGroups.forEach(function(group) {
        maxFail = maxFail && AWE.Util.Rules.requirementGroupFailsDueToMaxRequirement(group, settlement, character, null, false); // DO NOT CONSIDER JOBS IN QUEUE
      });
      return maxFail;
    },    

  createJobPressed: function(evt) {
      this.get('controller').trainingCreateClicked(this.get('queue'),  this.get('number'));
    },

  resourceExchangePressed: function() { 
      var dialog = AWE.UI.Ember.ResourceExchangeDialog.create(); 
      WACKADOO.presentModalDialog(dialog); 
      return false; 
    },

  trainingButtonUIMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_TRAINING_DIALOG_FLOW) ;
    }.property('queue.jobs_count', 'AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

});

module.ArtileryInfoView  = module.InfantryInfoView.extend ({
  templateName: 'army-info-tab3-view',

  unitCategory: "unitcategory_artillery",
});

module.CavaleryInfoView  = module.InfantryInfoView.extend ({
  templateName: 'army-info-tab4-view',

  unitCategory: "unitcategory_cavalry",
});

module.SpecialUnitInfoView  = module.InfantryInfoView.extend ({
  templateName: 'army-info-tab5-view',

  unitCategory: "unitcategory_special",
});


  module.ArmyInfoNewTabView = module.TabArmyInfoView.extend({

    controller: null,
    character: null,
    alliance:  null,
    allianceMember: null,
    unitTypes: null,
    garrisonArmy: null,
    settlement: null,
    trainingQueues: null,
    startTab: 0,

    init: function() {

     this.set('tabViews', [
       { key:   "tab1",
         title: AWE.I18n.lookupTranslation('encyclopedia.infantry'), 
         view:  module.InfantryInfoView.extend({ 
          controllerBinding: "parentView.parentView.controller",
          garrisonArmyBinding: "parentView.parentView.garrisonArmy",
          settlementBinding: "parentView.parentView.settlement",
          trainingQueuesBinding: "parentView.parentView.trainingQueues"
          }),
         isTitelTab: false,
         buttonClass: "middle-menu-button-military"
       },
       { key:   "tab2",
         title: AWE.I18n.lookupTranslation('encyclopedia.artillery'), 
         view:  module.ArtileryInfoView.extend({ 
          controllerBinding: "parentView.parentView.controller",
          garrisonArmyBinding: "parentView.parentView.garrisonArmy",
          settlementBinding: "parentView.parentView.settlement",
          trainingQueuesBinding: "parentView.parentView.trainingQueues",
          }),
         isTitelTab: false,
         buttonClass: "middle-menu-button-military"
       },
       { key:   "tab3",
         title: AWE.I18n.lookupTranslation('encyclopedia.cavalery'), 
         view:  module.CavaleryInfoView.extend({ 
          controllerBinding: "parentView.parentView.controller",
          garrisonArmyBinding: "parentView.parentView.garrisonArmy",
          settlementBinding: "parentView.parentView.settlement",
          trainingQueuesBinding: "parentView.parentView.trainingQueues",
          }),
         isTitelTab: false,
         buttonClass: "middle-menu-button-military"
       },
       { key:   "tab4",
         title: AWE.I18n.lookupTranslation('encyclopedia.specialUnits'), 
         view:  module.SpecialUnitInfoView.extend({ 
          controllerBinding: "parentView.parentView.controller",
          garrisonArmyBinding: "parentView.parentView.garrisonArmy",
          settlementBinding: "parentView.parentView.settlement",
          trainingQueuesBinding: "parentView.parentView.trainingQueues",
          }),
         isTitelTab: false,
         buttonClass: "middle-menu-button-military"
       }
     ]);

     this._super();
   },

   changeTab: function() {
    this.selectTabByNumber(this.get("startTab"));
   }.observes("startTab"),

 });

module.MilitaryTabView = module.TabViewNew.extend({

  character: null,
  alliance:  null,
  allianceMember: null,
  unitTypes: null,
  garrisonArmy: null,
  settlement: null,
  trainingQueues: null,
  startTab: 0,
  subTab: 0,

  init: function() {
    var self = this;

     this.set('tabViews', [
       { key:   "tab1",
         title: AWE.I18n.lookupTranslation('encyclopedia.garrison'), 
         view:  module.GarrisonInfoView.extend({
         unitTypesBinding: "parentView.parentView.unitTypes",
         garrisonArmyBinding: "parentView.parentView.garrisonArmy",
          }),
         buttonClass: "left-menu-button"
       }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
       { key:   "tab2",
         title: AWE.I18n.lookupTranslation('settlement.training.recruit'), 
         view:  module.ArmyInfoNewTabView.extend({ 
          parentView: self,
          controllerBinding: "parentView.controller",
          garrisonArmyBinding: "parentView.garrisonArmy",
          settlementBinding: "parentView.settlement",
          trainingQueuesBinding: "parentView.trainingQueues",
          startTabBinding: 'parentView.subTab'
          }),
         buttonClass: "right-menu-button"
       }
     ]);

     this._super();
   },

   changeTab: function() {
    this.selectTabByNumber(this.get("startTab"));
   }.observes("startTab"),
});

module.ArmyUnitResourceView  = Ember.View.extend ({
    templateName: 'army-icon-big-button',
    unitType: null,
    queue: null,
    controller: null,

    openDialog: function()
      {
        var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types') || [];
        var unitTypeLocalObject = this.get("unitType");
        var self = this;
        unitTypes.forEach(function(rulesUnitType) 
        {
          if(rulesUnitType.id == unitTypeLocalObject.id)//cavalery
            {
              var dialog = AWE.UI.Ember.EncyclopediaUnitNewView.create({unit: rulesUnitType});
              WACKADOO.presentModalDialog(dialog);
              return false;
            }
        });
        return false; // prevent default behavior
      },

    openJobDialog: function()
      {
          var unitTypeObject = this.get("unitType");
          var queueObject = this.get('queue');
          var controllerLocal = this.get('controller');
          var dialog = AWE.UI.Ember.ArmyRecruitmentJobView.create({
            unitType: unitTypeObject,
            queue: queueObject,
            controller: controllerLocal
          });
          WACKADOO.presentModalDialog(dialog);
          return false;
      },

    unmetRequirementGroups: function() {
      var settlement = this.getPath('queue.settlement');
      var character = settlement ? settlement.owner() : null;
      var failed =  AWE.Util.Rules.failedRequirementGroups(this.getPath('unitType.requirementGroups'), settlement, character, null, false); // do NOT consider construction jobs in building queue
      return failed || []
    }.property('unitType', 'queue.settlement.hashableSlots.collection@each.level', 'queue.settlement.hashableSlots.changedAt'),


    /** bool for indicating whether or not all requirements for constructin
     * this building are met. */
    requirementsMet: function() {
     var unmetRequirements = this.get('unmetRequirementGroups');
      return !unmetRequirements || unmetRequirements.length === 0;
    }.property('unmetRequirementGroups', 'unmetRequirementGroups.length'), 
    
    requirementUnmet: function() {
      return !this.get('requirementsMet');
    }.property('requirementsMet'),

    number: "1",

    costs: function() {
        var unitType = this.get('unitType');
        return unitType && unitType.costs ? AWE.Util.Rules.lookupResourceCosts(unitType.costs) : null;
    }.property('unitType').cacheable(),
    
    getStoneCosts: function()
    {    
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var stoneId = rules.getResourceTypeWithSymbolicId("resource_stone").id;
      }      
      var stoneCost = this.getCostsForResource(stoneId);
      return stoneCost;
    }.property('costs').cacheable(),

    getWoodCosts: function()
    {
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var woodId = rules.getResourceTypeWithSymbolicId("resource_wood").id;
      } 
      var woodCost = this.getCostsForResource(woodId);
      return woodCost;

    }.property('costs').cacheable(),

    getFurCosts: function()
    {
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var furId = rules.getResourceTypeWithSymbolicId("resource_fur").id;
      } 
      var furCost = this.getCostsForResource(furId);
      return furCost;

    }.property('costs').cacheable(),

    getTotalStoneCosts: function()
    { 
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var stoneId = rules.getResourceTypeWithSymbolicId("resource_stone").id;
      } 
      var stoneCost = this.getTotalCostsForResource(stoneId);
      if(stoneCost.toString().match(/[0-9]+/))
      {
        return stoneCost;
      }
      else
      {
        return "0";
      }
    }.property('totalCosts').cacheable(),

    getTotalWoodCosts: function()
    {
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var woodId = rules.getResourceTypeWithSymbolicId("resource_wood").id;
      } 
      var woodCost = this.getTotalCostsForResource(woodId);
      if(woodCost.toString().match(/[0-9]+/))
      {
        return woodCost;
      }
      else
      {
        return "0";
      }

    }.property('totalCosts').cacheable(),

    getTotalFurCosts: function()
    {
      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var furId = rules.getResourceTypeWithSymbolicId("resource_fur").id;
      } 
      var furCost = this.getTotalCostsForResource(furId);
      
      if(furCost.toString().match(/[0-9]+/))
      {
        return furCost;
      }
      else
      {
        return "0";
      }

    }.property('totalCosts').cacheable(),

    getCostsForResource: function(res)
    {
      var resId = parseInt(res);
      var resourceCosts = this.get('costs') || [];
      var self = this;
      var resourceCost = 0;

      resourceCosts.forEach(function(resource){
        var resourceType = resource.resourceType;
        if(resourceType.id == resId)
        {
          resourceCost = resource.amount;
        }
      });
      return resourceCost;
    },

    getTotalCostsForResource: function(res)
    {
      var resId = parseInt(res);
      var resourceCosts = this.get('totalCosts') || [];
      var self = this;
      var resourceCost = 0;

      resourceCosts.forEach(function(resource){
        var resourceType = resource.resourceType;
        if(resourceType.id == resId)
        {
          resourceCost = resource.amount;
        }
      });
      return resourceCost;
    },

    totalCosts: function() {
        return AWE.Util.Rules.multipliedResourceCosts(this.get('costs'), this.get('number') || 0.0);
    }.property('costs', 'number').cacheable(),

    getLevel: function()
    {
        var unitID = this.getPath('unitType.id');
        var lvl = 0;
        var rules = AWE.GS.RulesManager.getRules();
        if (rules)
        {
          var warrior = rules.getUnitTypeWithSymbolicId("unit_warrior").id;
          var clubbers = rules.getUnitTypeWithSymbolicId("unit_clubbers").id;
          var clubbers2 = rules.getUnitTypeWithSymbolicId("unit_clubbers_2").id;
          var clubbers3 = rules.getUnitTypeWithSymbolicId("unit_clubbers_3").id;
          var treeHuggers = rules.getUnitTypeWithSymbolicId("unit_tree_huggers").id;

          var thrower = rules.getUnitTypeWithSymbolicId("unit_thrower").id;
          var thrower2 = rules.getUnitTypeWithSymbolicId("unit_thrower_2").id;
          var thrower3 = rules.getUnitTypeWithSymbolicId("unit_thrower_3").id;
          var thrower4 = rules.getUnitTypeWithSymbolicId("unit_thrower_4").id;

          var lightCavalry = rules.getUnitTypeWithSymbolicId("unit_light_cavalry").id;
          var lightCavalry2 = rules.getUnitTypeWithSymbolicId("unit_light_cavalry_2").id;
          var lightCavalry3 = rules.getUnitTypeWithSymbolicId("unit_light_cavalry_3").id;
          var lightCavalry4 = rules.getUnitTypeWithSymbolicId("unit_light_cavalry_4").id;

          var littleChief = rules.getUnitTypeWithSymbolicId("unit_little_chief").id;
          var greatChief = rules.getUnitTypeWithSymbolicId("unit_great_chief").id;
        }

        switch(unitID)
        {
          //infantry
          case warrior:
            lvl = 1;
            break;
          case clubbers:
            lvl = 2;
            break;
          case clubbers2:
            lvl = 3;
            break;
          case clubbers3:
            lvl = 4;
            break;
          case treeHuggers:
            lvl = 5;
            break;
            //archer
          case thrower:
            lvl = 1;
            break;
          case thrower2:
            lvl = 2;
            break;
          case thrower3:
            lvl = 3;
            break;
          case thrower4:
            lvl = 4;
            break;
            //cavalery
          case lightCavalry:
            lvl = 1;
            break;
          case lightCavalry2:
            lvl = 2;
            break;
          case lightCavalry3:
            lvl = 3;
            break;
          case lightCavalry4:
            lvl = 4;
            break;
            //special
          case littleChief:
            lvl = 1;
            break;
          case greatChief:
            lvl = 2;
            break;
        }
        return lvl;
    }.property('unitType').cacheable(),

    productionTime: function() {
      var unitType = this.get('unitType');
      var speed    = this.getPath('queue.speed') || 1.0;
      log('SPEED', this.getPath('queue.speed'));
      return unitType ? AWE.Util.Rules.calculateProductionTime(unitType.production_time, speed) : null;
    }.property('queue.speed').cacheable(),   ///< TODO : also update, when queue's speedup changes.

    formatSeconds: function (seconds)
    {
      var t = new Date(1970,0,1);
      t.setSeconds(seconds);
      var s = t.toTimeString().substr(0,8);
      if(seconds > 86399)
        s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
      return s;
    },

    totalProductionTime: function() {
        var productionTime  = this.get('productionTime');
        var number          = this.get('number')
        return productionTime && number > 0 ? productionTime * number : null;
    }.property('productionTime', 'number').cacheable(), 

    formattedProductioTime: function(){
      return this.formatSeconds(this.get('productionTime'));
    }.property('productionTime').cacheable(),

    formattedTotalProductioTime: function(){
      return this.formatSeconds(this.get('totalProductionTime'));
    }.property('totalProductionTime').cacheable(),

   });

module.ArmyUnitResourceInfoView  = module.ArmyUnitResourceView.extend ({
    templateName: 'army-resource-info',
});

module.ArmyUnitInfoButtonView = module.ArmyUnitInfoView.extend({
  templateName: 'army-info-button',
  unitType: null,

});

module.ArmyUnitSmallInfoButtonView = module.ArmyUnitInfoView.extend({
  templateName: 'army-icon-small',
  unitType: null,

  unitClass: function() {
    return "unit_" + this.getPath("unitType.unitType.symbolic_id");
  }.property(),

});
//military Recruitment dialog end

//Recruitment job dialog start
  module.ArmyRecruitmentJobView = module.PopUpDialog.extend({
    templateName: 'army-recruitment-view',
    
    unitType: null,
    queue: null,
    controller: null,

    isInTutorial: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      if(tutorialState.isUIMarkerActive(AWE.GS.MARK_UNITS_BUTTON)){
        return true;
      }
      return false;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

    });

  module.ArmyRecruitmentJobInfoView = module.ArmyUnitResourceView.extend({
    templateName: 'army-recruitment-info-view',

    numberValueRegex: /[^0-9]+/,
    maxUnitRecruitment: 1000,
    minUnitRecruitment: 1,

    isUIMarker: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return tutorialState.isUIMarkerActive(AWE.GS.MARK_UNITS_BUTTON) ;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),

    getUnitCategoryName: function()
    {

      var rules = AWE.GS.RulesManager.getRules();
      if (rules)
      {
        var infantryCategoryId = rules.getUnitCategoryNumId("unitcategory_infantry");
        var cavaleryCategoryId = rules.getUnitCategoryNumId("unitcategory_cavalry");
        var artilleryCategoryId = rules.getUnitCategoryNumId("unitcategory_artillery");
        var specialCategoryId = rules.getUnitCategoryNumId("unitcategory_special");
      }


      var localUnitType = this.get('unitType');
      var unitTypeCategoryName = '';
      if(localUnitType.category == infantryCategoryId)
        unitTypeCategoryName = AWE.I18n.lookupTranslation('encyclopedia.infantry');//"Infantry";
      else if(localUnitType.category == cavaleryCategoryId)
        unitTypeCategoryName = AWE.I18n.lookupTranslation('encyclopedia.cavalery');//"Cavalery";
      else if(localUnitType.category == artilleryCategoryId)
        unitTypeCategoryName = AWE.I18n.lookupTranslation('encyclopedia.artillery');//"Artillery";
      else if(localUnitType.category == specialCategoryId)
        unitTypeCategoryName = AWE.I18n.lookupTranslation('encyclopedia.specialUnits');//"Special Units";

      return unitTypeCategoryName;
    }.property().cacheable(),

    setupJobPressed: function()
    {
      if(parseInt(this.get('number')) > this.get("maxUnitRecruitment"))
      {
        var dialog = AWE.UI.Ember.InfoDialog.create({
          message: AWE.I18n.lookupTranslation('settlement.training.error.tooLargeNumber')
        });
        WACKADOO.presentModalDialog(dialog);
      }
      else
      {
        this.get('controller').trainingCreateClicked(this.get('queue'), this.getPath('unitType.id'), this.get('number'));
        this.get('parentView').destroy();
      }
    },
  });

  module.JobsRangeView = AWE.UI.Ember.SliderView.extend({
    classNames: ["jobs-range-slider"],
    max: 500,
    min: 1,
    valueBinding: "number",
  });
//Recruitment job dialog end

module.ArmyTrainingJobNewView = Ember.View.extend ({
    templateName: 'army-job-cell',
    job: null,
    controller: null,

    timeRemaining: null,
    timer:         null,

    activeJobRemainingFactor: null,
    totalJobsRemainingFactor: null,
    
    cancelJobPressed: function(evt) {
      this.get('controller').trainingCancelClicked(this.get('job'));
    },
    
    speedupJobPressed: function(event) {
      this.get('controller').trainingSpeedupClicked(this.get('job'));
    },

    isArmySizeMax: function()
    {
      var army = this.getPath('parentView.garrisonArmy');
      return (army.size_max <= army.size_present);

    }.property('parentView.garrisonArmy').cacheable(),

    active: function() {
      return this.get('job').active_job !== null;
    }.property('job.active_job'),   
    
    first: function() {
      var jobCollection = this.getPath('parentView.queue.hashableJobs.collection');
      return jobCollection && jobCollection[0] && jobCollection[0] === this.get('job');
    }.property('parentView.queue.hashableJobs.changedAt'),    
    
    calcTimeRemaining: function() {
      var finishedAt = this.getPath('job.active_job.finished_total_at');//finished_active_at
      var finishedActiveAt = this.getPath('job.active_job.finished_active_at');
      if (!finishedAt) {
        return ;
      }
      var finish = Date.parseISODate(finishedAt);
      var now = new Date();
      var remaining = (finish.getTime() - now.getTime()) / 1000.0;
      remaining = remaining < 0 ? 0 : remaining;
      this.set('timeRemaining', remaining);

      var finishActive = Date.parseISODate(finishedActiveAt);
      var now = new Date();
      var remainingActive = (finishActive.getTime() - now.getTime()) / 1000.0;
      remainingActive = remainingActive < 0 ? 0 : remainingActive;

      var createdTotalAt = Date.parseISODate(this.getPath('job.active_job.started_total_at'));
      var createdActiveAt = Date.parseISODate(this.getPath('job.active_job.started_active_at'));

      var comleteTotalTime = finish.getTime() - createdTotalAt.getTime();
      var completeActiveTime = finishActive.getTime() - createdActiveAt.getTime();
      if(comleteTotalTime == 0)
      {
        comleteTotalTime = 1;
      }

      if(completeActiveTime == 0)
      {
        completeActiveTime = 1;
      }

      var remainingTotalFactor = remaining/((comleteTotalTime)/(1000.0));
      var remainingActiveFactor = remainingActive/((completeActiveTime)/(1000.0));
      
      this.set('activeJobRemainingFactor', (1 - remainingActiveFactor));
      this.set('totalJobsRemainingFactor', (1 - remainingTotalFactor));
    //totalJobsRemainingFactor: null,
    },

    totalBarWidth: function(){
      var progress = parseInt(this.get('totalJobsRemainingFactor')*192);
      //return "background-size: "+ progress + "%" + " 100%";
      return "width: "+ progress + "px";
    }.property('totalJobsRemainingFactor').cacheable(),
    
    activeBarWidth: function(){
      var progress = parseInt(this.get('activeJobRemainingFactor')*188);//188 width of training progress bar
      return "width: "+ progress + "px";
    }.property('activeJobRemainingFactor').cacheable(),

    isTrainingSpeedupPossible: function() {
      return this.getPath('active') && !this.getPath('job.hurried') && AWE.Util.Rules.isTrainingSpeedupPossible(this.getPath('timeRemaining'));
    }.property('timeRemaining', 'active'),


    finished: function() {
      var t = this.get('timeRemaining');
      return t !== undefined && t !== null && t <= 0;
    }.property('timeRemaining'),    
    
    startTimer: function() {
      var timer = this.get('timer');
      if (!timer) {
        timer = setInterval((function(self) {
          return function() {
            self.calcTimeRemaining();
          };
        }(this)), 1000);
        this.set('timer', timer);
      }
    },
    
    stopTimer: function() {
      var timer = this.get('timer');
      if (timer) {
        clearInterval(timer);
        this.set('timer', null);
      }
    },
    
    startTimerOnBecommingActive: function() {
      var active = this.get('active');
      if (active && this.get('timer')) {
        this.startTimer();
      }
      return ;
    }.observes('active'),
    
    
    didInsertElement: function() {
      this.startTimer();
    },
    
    willDestroyElement: function() {
      this.stopTimer();
    },

    formatedRemainingTime: function(){
      var remTime = this.get('timeRemaining');
      return this.formatSecondsForJob(remTime);
    }.property('timeRemaining').cacheable(),

    formatSecondsForJob: function (seconds)
    {
      var t = new Date(1970,0,1);
      t.setSeconds(seconds);
      var s = t.toTimeString().substr(0,8);
      if(seconds > 86399)
        s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
      return s;
    },
});
//NEW DIALOGS END
  
  module.ArmyDialog = module.Dialog.extend({

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
      (this.get('unitTypes') || []).forEach(function(unitType){
        sum += unitType.get('garrisonUnits');
      });
      return sum;
    }.property('unitTypes.@each.garrisonUnits').cacheable(),
    
    otherSum: function(){
      var sum = 0;
      (this.get('unitTypes') || []).forEach(function(unitType){
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
      (this.get('unitTypes') || []).forEach(function(unitType){
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
    
  });
  
  module.ArmyCreateDialog = module.ArmyDialog.extend({
    templateName: 'army-create-dialog',
    
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

    unitTypes: function() {
      var list = [];
      var details = this.getPath('garrisonArmy.details');
      var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types');
      if (details) { log('build list')
        AWE.Ext.applyFunction(unitTypes, function(unitType) {
          if (details[unitType.db_field] !== undefined && details[unitType.db_field] > 0) {
            list.push(Ember.Object.create({
              name: unitType.name,
              symbolic_id: unitType.db_field, 
              allUnits: details[unitType.db_field],
              garrisonUnits: details[unitType.db_field],
              otherUnits: 0,
            }));
          }
        });
      }
      log("LIST", list, details);
      return list;
    }.property('garrisonArmy.details.@each', 'unitTypesChange').cacheable(),

    unitQuantities: function() {
      var unitQuantities = {};
      var unitTypes = this.get('unitTypes') || [];
      unitTypes.forEach(function(unitType) {
        var quantity = unitType.get('otherUnits');
        if (quantity > 0) {
          unitQuantities[unitType.get('symbolic_id')] = quantity; 
        }
      });
      return unitQuantities;
    },
    
    otherArmySizeMaxBinding: 'settlement.army_size_max',    
    
    armyName: '',
    
    createPressed: function() {
      log('ERROR Action not connected: createWasPressed.');
    },
  });
  
  module.ArmyChangeDialog = module.ArmyDialog.extend({
    templateName: 'army-change-dialog',
    
    garrisonArmy: null,
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
      var otherDetails = this.getPath('otherArmy.details') || [];
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
  
  module.ArmyForm = Ember.View.extend({
    templateName: 'army-form',
    unitTypes: null,
  });
  
  module.ArmyNameTextfield = Ember.TextField.extend({
  });
  
  module.UnitRowView = Ember.View.extend({
    unitType: null,
    
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
    },
  });
 
  module.GarrisonArmyUnitTextfield = Ember.TextField.extend({
    
    allUnits: null,
    garrisonUnits: null,
    otherUnits: null,
    
    locked: false,
    
    value: Ember.computed(function(key, value) {
      // getter
      if (arguments.length === 1) {
        return this.get('garrisonUnits');
      // setter
      } else {
        var units = parseInt(value);
        var allUnits = this.get('allUnits');
        if (units > allUnits) {
          units = allUnits;
        }
        else if (isNaN(units) || units < 0) {
          units = 0;
        }
        this.set('garrisonUnits', units);
        this.set('otherUnits', allUnits - units);
        return units;
      }
    }).property('garrisonUnits'),
    
    insertNewline: function() {
      if (this.getPath('parentView.parentView.parentView').createPressed) {
        this.getPath('parentView.parentView.parentView').createPressed();
      };
      
      if (this.getPath('parentView.parentView.parentView').changePressed) {
        this.getPath('parentView.parentView.parentView').changePressed();
      };
    },    
  });
  
  module.OtherArmyUnitTextfield = Ember.TextField.extend({
    
    allUnits: null,
    garrisonUnits: null,
    otherUnits: null,
    
    locked: false,
    
    value: Ember.computed(function(key, value) {
      // getter
      if (arguments.length === 1) {
        return this.get('otherUnits');
      // setter
      } else {
        var units = parseInt(value);
        var allUnits = this.get('allUnits');
        if (units > allUnits) {
          units = allUnits;
        }
        else if (isNaN(units) || units < 0) {
          units = 0;
        }
        this.set('otherUnits', units);
        this.set('garrisonUnits', allUnits - units);
        return units;
      }
    }).property('otherUnits'),
    
    insertNewline: function() {
      if (this.getPath('parentView.parentView.parentView').createPressed) {
        this.getPath('parentView.parentView.parentView').createPressed();
      };
      
      if (this.getPath('parentView.parentView.parentView').changePressed) {
        this.getPath('parentView.parentView.parentView').changePressed();
      };
    },
  });
  
  module.ArmyListDialog = Ember.View.extend({
    templateName: "army-list-view",
    
    onClose:    null,

    init: function() {
      AWE.GS.ArmyManager.updateArmiesForCharacter(AWE.GS.game.getPath('currentCharacter.id'),
        AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {});

      this._super();
    },

    armies: function() {
      var armies = AWE.GS.ArmyManager.getArmiesOfCharacter(AWE.GS.game.getPath('currentCharacter.id'));
      var list   = [];
      var self   = this;
      
      for (id in armies) {
        var army = armies[id];

        // We need to put them into an ember object to iterate over them in the template
        if (!army.isGarrison()) {
          list.push(army);
        }
      }

      for (var i = 0; i < list.length; ++i) {
        for (var j = 0; j < list.length; ++j) {
          var _army = list[i];
          if (list[i].get('exp') > list[j].get('exp')) {
            list[i] = list[j];
            list[j] = _army;
          }
        }
      }

      return list;
    }.property('controller'),


    closeClicked: function() {
      $('#layers').css('overflow', 'visible');
      this.destroy();
    },

    destroy: function() {
      if (this.onClose) {
        this.onClose(this);
      }   
      this._super();    
    },  
  });

  module.ArmyListItem = Ember.View.extend({
    templateName: "army-list-item",
    army: null,
    regionName: null,

    updateRegionName: function() {
      var regionId = this.getPath('army.region_id');
      var region = AWE.Map.Manager.getRegion(regionId);

      if(typeof region === 'undefined') {
        var self = this;
        AWE.Map.Manager.fetchSingleRegionById(regionId, function(region) {
          self.set('regionName', region.name());
        });
      }
      else {
        this.set('regionName', region.name());
      }
    }.observes('army', 'army.region_id'),

    infoPressed: function() {
      var army = this.getPath('army');
      if (!army) {
        return ;
      }   
      var dialog = AWE.UI.Ember.ArmyInfoNewDialog.create({
        army: army,
      }); 
      WACKADOO.presentModalDialog(dialog);   
      return false; // prevent default behavior
    },  

    regionPressed: function() {
      var mapController = WACKADOO.activateMapController(true);
      WACKADOO.closeAllModalDialogs();
      mapController.centerRegionAndMarkArmy(this.get('army'));
    },

    namePressed: function() {
      var mapController = WACKADOO.activateMapController(true);
      WACKADOO.closeAllModalDialogs();
      mapController.centerLocationAndMarkArmy(this.get('army'));
    },

    armyStatus: function() {
      var army = this.get('army');

      if (army.get('isFighting')) {
        return AWE.I18n.lookupTranslation('army.list.status.fighting');
      }
      else if (army.get('isMoving')) {
        return AWE.I18n.lookupTranslation('army.list.status.moving');
      }
      else if (parseInt(army.get('stance')) == 0) {
        return AWE.I18n.lookupTranslation('army.list.status.neutral');
      }
      else if (parseInt(army.get('stance')) == 1) {
        return AWE.I18n.lookupTranslation('army.list.status.defending');
      }
      // Do we need to check another stance here or a default value?
    }.property('army.updated_at'),

  });

  module.ArmyView = AWE.UI.Ember.Pane.extend({
    width: 58,
    height: 77,
   
    shape: null,
    controller: null,
    army: null,
    
    init: function() {
      this._super();
    },


    armyUpdate: function() {
      var army   = this.get('army');
      var shape  = this.get('shape');
      var width  = this.get('width');
      var height = this.get('height');

      var mapController = WACKADOO.activateMapController(true);
      AWE.GS.ArmyManager.updateArmy(army.getId(), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function () {
        mapController.setModelChanged();
      });
   
      if(shape) {
        this.removeChild(shape);
      }

      if(Ember.none(army)) {
        this.set('shape', null);
        return ;
      }

      shape = AWE.UI.createArmyView();
      shape.initWithControllerAndArmy(this.get('controller'), army);
      shape.setFrame(AWE.Geometry.createRect(0, 24, width, height));
      shape.setScaleX(0.5);
      shape.setScaleY(0.5);
      
      this.addChild(shape);
      this.set('shape', shape);
      shape.updateView();     
      this.update();
    }.observes('army'),

  });

  return module;
    
}(AWE.UI.Ember || {}));

