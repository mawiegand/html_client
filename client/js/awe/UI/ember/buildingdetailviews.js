/**
 * @fileOverview 
 * Ember.JS views for displaying details about buildings.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {}; 

AWE.UI.Ember = (function(module) {
    
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/buildingdetailviews.html');
  
  /** @class
   * @name AWE.UI.Ember.SelectBuildingDialog */
  module.SelectBuildingDialog = Ember.View.extend( /** @lends AWE.UI.Ember.SelectBuildingDialog# */ {
    templateName: "settlement-dialog-select-building",
    heading: 'Select Building',
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    optionClicked: function(event) {
      var slot = this.get('slot');
      var building = event.view.getPath('building');
      var type = event.view.getPath('building.type');
      this.get('controller').constructionOptionClicked(slot, building, type);
    },         
  });  

  /** @class
   * @name AWE.UI.Ember.BuildingOptionView */
  module.BuildingOptionView = module.HoverableView.extend( /** @lends AWE.UI.Ember.BuildingOptionView# */ {
    classNameBindings: ['building.requirementUnmet'],
  });
  
 
  /** @class
   * @name AWE.UI.Ember.BuildingDetailsDialog */  
  module.BuildingDetailsDialog = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingDetailsDialog# */ {
    templateName: "settlement-dialog-building-details",
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    upgradeClicked: function(event) {
      this.get('controller').constructionUpgradeClicked(this.get('slot'));
    },         
    
  }); 
  
  
  /** @class
   * @name AWE.UI.Ember.TrainableUnitButtonView */  
  module.TrainableUnitButtonView = Ember.View.extend( /** @lends AWE.UI.Ember.TrainableUnitButtonView# */ {
    templateName: "trainable-unit-button",
      
    classNameBindings: ['selected'],  
    
      
    click: function(event) {
      this.get('parentView').set('selectedUnitType', this.get('unitType'));
    },     
    
    selected: function() {
      return this.get('unitType') === this.getPath('parentView.selectedUnitType');
    }.property('parentView.selectedUnitType').cacheable(),
    
    
    // TODO: check requirements and costs. should become a mixin somehow
  
    requirementsMet: function() {
      return true ;
    }.property('queue.settlement', 'unitType').cacheable(),
    
    costsMet: function() {
      return true ;
    }.property('queue.settlement', 'unitType').cacheable(),
    
    
  });
  
  /** @class
   * @name AWE.UI.Ember.RequirementView */  
  module.RequirementView = Ember.View.extend( /** @lends AWE.UI.Ember.RequirementView# */ {
    templateName: "requirement-view",

    requirement: null,

    building: function() {
      return this.getPath('requirement.type') === 'building';
    }.property('requirement.type').cacheable(),

    science: function() {
      return this.getPath('requirement.type') === 'science';
    }.property('requirement.type').cacheable(),    
    
    type: function() {
      if (this.get('building')) {
        return AWE.GS.RulesManager.getRules().getBuildingType(this.getPath('requirement.id'));
      }
      else if (this.get('science')) {
        return AWE.GS.RulesManager.getRules().getScienceType(this.getPath('requirement.id'));
      }
      return null;
    }.property('requiement.type').cacheable(),
    
    haveMinLevel: function() {
      return this.getPath('requirement.min_level') && this.getPath('requirement.min_level') > 0;
    }.property('requirement.min_level').cacheable(),
    
    haveMaxLevel: function() {
      return this.getPath('requirement.max_level') || this.getPath('requirement.max_level') === 0;
    }.property('requirement.max_level').cacheable(),

  });
  
  /** @class
   * @name AWE.UI.Ember.DiplomacyView */  
  module.DiplomacyView = Ember.View.extend( /** @lends AWE.UI.Ember.DiplomacyView# */ {
    templateName: "diplomacy-view",
    
    characterBinding: 'AWE.GS.player.currentCharacter',
    
    leaveAlliance: function() {
      var self = this;
      var dialog = AWE.UI.Ember.InfoDialog.create({
        heading:    'Leave Alliance',
        message:    'Are you sure about leaving your alliance?',
        allianceId: this.getPath('character.alliance_id'),
        
        cancelPressed: function() {
          this.destroy();
        },
        okText: 'Yes',
        okPressed: function(event) {
          console.log('Player wants to leave alliance!')  
          var action = AWE.Action.Fundamental.createLeaveAllianceAction(this.get('allianceId'));
          if (!action) {
            console.log('ERROR: Could not create leave alliance action');
          }
          else {
            AWE.Action.Manager.queueAction(action);       
          }     
          this.destroy();  
        },
      });      
      WACKADOO.presentModalDialog(dialog);
    },
    
  });  
  
  
  return module;
    
}(AWE.UI.Ember || {}));




