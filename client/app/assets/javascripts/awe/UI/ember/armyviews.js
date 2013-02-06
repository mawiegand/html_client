/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>, Julian Schmid
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {


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
  
  return module;
    
}(AWE.UI.Ember || {}));




