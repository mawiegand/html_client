/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {


//NEW DIALOGS START
//need custom tabs for army info
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
  module.ArmyInfoDialogNew = module.ArmyNewCreateDialog.extend({
    templateName: 'army-new-info-dialog',

    //army: null,
    garrisonArmy: null,
    owner: null,
    building: null,

    displayHeading: true,
    
    settlement: null,
  
    setSettlment: function(){
      this.set('settlement',this.getPath('garrisonArmy.homeSettlement'));
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

  });

  module.ArmyInfoNewTabView = module.TabArmyInfoView.extend({

    character: null,
    alliance:  null,
    allianceMember: null,
    unitTypes: null,
    garrisonArmy: null,
    building: null,
    settlement: null,
    trainingQueues: null,

    init: function() {

     this.set('tabViews', [
       { key:   "tab1",
         title: "Garrison", 
         view:  module.GarrisonInfoView.extend({
         unitTypesBinding: "parentView.parentView.unitTypes",
         garrisonArmyBinding: "parentView.parentView.garrisonArmy",
          }),
         isTitelTab: true,
         buttonClass: "header-menu-button-military"
       }, // remember: we need an extra parentView to escape the ContainerView used to display tabs!
       { key:   "tab2",
         title: "Infantry", 
         view:  module.InfantryInfoView.extend({ 
          buildingBinding: "parentView.parentView.building",
          garrisonArmyBinding: "parentView.parentView.garrisonArmy",
          settlementBinding: "parentView.parentView.settlement",
          trainingQueuesBinding: "parentView.parentView.trainingQueues",
          }),
         isTitelTab: false,
         buttonClass: "middle-menu-button-military"
       },
       { key:   "tab3",
         title: "Artillery", 
         view:  module.ArtileryInfoView.extend({ 
          buildingBinding: "parentView.parentView.building",
          garrisonArmyBinding: "parentView.parentView.garrisonArmy",
          settlementBinding: "parentView.parentView.settlement",
          trainingQueuesBinding: "parentView.parentView.trainingQueues",
          }),
         isTitelTab: false,
         buttonClass: "middle-menu-button-military"
       },
       { key:   "tab4",
         title: "Cavalery", 
         view:  module.CavaleryInfoView.extend({ 
          buildingBinding: "parentView.parentView.building",
          garrisonArmyBinding: "parentView.parentView.garrisonArmy",
          settlementBinding: "parentView.parentView.settlement",
          trainingQueuesBinding: "parentView.parentView.trainingQueues",
          }),
         isTitelTab: false,
         buttonClass: "middle-menu-button-military"
       },
       { key:   "tab5",
         title: "Special Units", 
         view:  module.SpecialUnitInfoView.extend({ 
          buildingBinding: "parentView.parentView.building",
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

 });

module.GarrisonInfoView  = module.ArmyChangeInfantryView.extend ({
  templateName: 'army-info-tab1-view',

  isAllUnits: true,
  garrisonArmy: null,
  unitTypes: null,
});

module.InfantryInfoView  = Ember.View.extend ({
  templateName: 'army-info-tab2-view',

  building: null,
  garrisonArmy: null,
  unitCategory: 2,//category is 0, but queueID 2
  settlement: null,
  trainingQueues: null,
  queue: null,
  setQueue: function(){
    var self = this;
    var trainingQueuesCurrent = self.get('trainingQueues');
    trainingQueuesCurrent.forEach(function(queueCurrent) {
        var queueType = queueCurrent.get('queueType');
        
        if(queueType.id == self.get('unitCategory'))
        {
          self.set('queue', queueCurrent);
        }
      });
  }.observes('garrisonArmy'),

  allUnitTypesForCategory: function()
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
  }.property().cacheable(), 

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

module.ArmyUnitResourceView  = Ember.View.extend ({
    templateName: 'army-icon-big-button',
    unitType: null,
    queue: null,

    openDialog: function()
      {
        var unitTypes = AWE.GS.RulesManager.getRules().get('unit_types');
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
          var dialog = AWE.UI.Ember.ArmyRecruitmentJobView.create({
            unitType: unitTypeObject,
            queue: queueObject,
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
      var stoneCost = this.getCostsForResource(0);
      return stoneCost;
    }.property('costs').cacheable(),

    getWoodCosts: function()
    {
      var woodCost = this.getCostsForResource(1);
      return woodCost;

    }.property('costs').cacheable(),

    getFurCosts: function()
    {
      var furCost = this.getCostsForResource(2);
      return furCost;

    }.property('costs').cacheable(),

    getTotalStoneCosts: function()
    { 
      var stoneCost = this.getTotalCostsForResource(0);
      return stoneCost;
    }.property('totalCosts').cacheable(),

    getTotalWoodCosts: function()
    {
      var woodCost = this.getTotalCostsForResource(1);
      return woodCost;

    }.property('totalCosts').cacheable(),

    getTotalFurCosts: function()
    {
      var furCost = this.getTotalCostsForResource(2);
      return furCost;

    }.property('totalCosts').cacheable(),

    getCostsForResource: function(res)
    {
      var resId = parseInt(res);
      var resourceCosts = this.get('costs');
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
      var resourceCosts = this.get('totalCosts');
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
        switch(unitID)
        {
          //infantry
          case 0:
            lvl = 1;
            break;
          case 1:
            lvl = 2;
            break;
          case 2:
            lvl = 3;
            break;
          case 3:
            lvl = 4;
            break;
          case 4:
            lvl = 5;
            break;
            //archer
          case 5:
            lvl = 1;
            break;
          case 6:
            lvl = 2;
            break;
          case 7:
            lvl = 3;
            break;
          case 8:
            lvl = 4;
            break;
            //cavalery
          case 9:
            lvl = 1;
            break;
          case 10:
            lvl = 2;
            break;
          case 11:
            lvl = 3;
            break;
          case 12:
            lvl = 4;
            break;
            //special
          case 14:
            lvl = 1;
            break;
          case 15:
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
      //var date = new Date(1970,0,1);
      //date.setSeconds(seconds);
      //return date.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
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

module.ArtileryInfoView  = module.InfantryInfoView.extend ({
  templateName: 'army-info-tab3-view',

  unitCategory: 3,//category is 1, but queueID 3
});

module.CavaleryInfoView  = module.InfantryInfoView.extend ({
  templateName: 'army-info-tab4-view',

  unitCategory: 4,//category is 2, but queueID 4
});

module.SpecialUnitInfoView  = module.InfantryInfoView.extend ({
  templateName: 'army-info-tab5-view',

  unitCategory: 6,//category is 4, but queueID 6
});

module.ArmyUnitInfoButtonView = module.ArmyUnitInfoView.extend({
  templateName: 'army-info-button',
  unitType: null,

});
//military Recruitment dialog end

//Recruitment job dialog start
  module.ArmyRecruitmentJobView = module.PopUpDialog.extend({
    templateName: 'army-recruitment-view',
   
    unitType: null,
    queue: null,

    });
  module.ArmyRecruitmentJobInfoView = module.ArmyUnitResourceView.extend({
    templateName: 'army-recruitment-info-view',

    getUnitCategoryName: function()
    {
      var localUnitType = this.get('unitType');
      var unitTypeCategoryName = '';
      if(localUnitType.category == 0)
        unitTypeCategoryName = "Infantry";
      else if(localUnitType.category == 1)
        unitTypeCategoryName = "Cavalery";
      else if(localUnitType.category == 2)
        unitTypeCategoryName = "Artillery";
      else if(localUnitType.category == 4)
        unitTypeCategoryName = "Special Units";

      return unitTypeCategoryName;
    }.property().cacheable(),
    });

  module.JobsRangeView  = Ember.TextField.extend({
    classNames: ["jobs-range-slider"],
    attributeBindings: ["min", "max"],
    min: 1,
    type: "range",
    max: function(){
      return 1000;
    }.property().cacheable(),
    valueBinding: "number",
  });
//Recruitment job dialog end

//NEW DIALOGS END

  module.ArmyInfoDialog = AWE.UI.Ember.InfoDialog.extend({
    classNames: ['army-info-dialog'],
    contentTemplateName: 'army-info-dialog',
    
    army: null,  
      
    arguments: {    // this must be improved; at least, we need bindings here. better: get rid of the arguments object
//      army: null,
      isSaving: false,
    },
    
/*    init: function(args) {
      this._super(args);
      this.setPath('arguments.army', this.get('army'));
    },
    
   armyObserver: function() {
      this.setPath('arguments.army', this.get('army'));
    }.observes('army'), */
    
    changeStanceCallback: null,
    changeNameCallback: null,
        
    changeNamePressed: function(event) {
          
      var changeDialog = AWE.UI.Ember.TextInputDialog.create({
        classNames: ['change-army-name-dialog'],
        heading: AWE.I18n.lookupTranslation('army.form.changeNameHeading'),
        input: this.getPath('army.name'),
        army: this.getPath('army'),
        
        okPressed: function() {
          var callback = this.getPath('parentView.changeNameCallback');
          var action   = AWE.Action.Military.createChangeArmyNameAction(this.get('army'), this.get('input'));
          AWE.Action.Manager.queueAction(action, function() {
            if (callback) {
              callback();
            }
          });  
          this.destroy();            
        },
        cancelPressed: function() { this.destroy(); }
      });
      WACKADOO.presentModalDialog(changeDialog);
    },

    changeStancePressed: function(event) {
      var self = this;
      var callback = this.get('changeStanceCallback');
      var army = this.getPath('army');

      // isSaving = true
      this.setPath('arguments.isSaving', true);
       
      var newStance = this.getPath('army.stance') === 0 ? 1 : 0;
      var action = AWE.Action.Military.createChangeArmyStanceAction(army, newStance);
      AWE.Action.Manager.queueAction(action, function() {
        AWE.GS.ArmyManager.updateArmy(army.getId(), null, function() {
          self.setPath('arguments.isSaving', false);
          if (callback) {
            callback();
          }
        });
      });  
    },
    
    locationPressed: function(event) {
      var self = this;
//      log('---> army.homeSettlement', this.getPath('army.homeSettlement'));
//      log('---> army.homeSettlement.location', this.getPath('army.homeSettlement.location'));
      var location = this.getPath('army.homeSettlement.location');
      
      if (location != null) {
        var mapController = WACKADOO.activateMapController(true);
        WACKADOO.closeAllModalDialogs();
        mapController.centerLocation(location);
      }
    },
  });

  
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
            list.push({ name: AWE.Util.Rules.lookupTranslation(unitType.name), number: army.details[unitType.db_field], unitType: unitType }) ;
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
      var unitTypes = this.get('unitTypes');
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
      var dialog = AWE.UI.Ember.ArmyInfoDialog.create({
        army: army,
      }); 
      dialog.showModal();    
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

