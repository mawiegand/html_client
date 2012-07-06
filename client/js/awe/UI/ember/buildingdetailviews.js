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
    classNameBindings: ['requirementUnmet'],
    
    requirementUnmetBinding: 'building.requirementUnmet',
  });
  
  
  module.BuildingOptionDetailView = Ember.View.extend({
   templateName:      "building-option-details",
   classNames: ['building-option-details'],
   classNameBindings:  "same",
   
   building: null,
   hovered: null,
   
   same: function() {
     return this.getPath('building.buildingId') === this.getPath('hovered.buildingId');
   }.property('building', 'hovered').cacheable(),
 });
   
 
  /** @class
   * @name AWE.UI.Ember.BuildingDetailsDialog */  
  module.BuildingDetailsDialog = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingDetailsDialog# */ {
    templateName: "settlement-dialog-building-details",
  
    sendingUpgradeBinding: 'controller.status.sendingUpgrade',
    sendingDestroyBinding: 'controller.status.sendingDestroy',
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    upgradeClicked: function(event) {
      this.get('controller').constructionUpgradeClicked(this.get('slot'));
    },         
    
    destroyClicked: function(event) {
      this.get('controller').constructionDestroyClicked(this.get('slot'));
    },         
    
    destroyClasses: function() {
      return this.getPath('slot.building_id') && (this.getPath('slot.hashableJobs.collection').length == 0 ? 'destroy' : 'destroy disabled');
    }.property('slot.hashableJobs.changedAt').cacheable(),
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
    
    allianceTag:      null,   // input bindings
    alliancePassword: null,
    
    newAllianceName:  null,
    newAllianceTag:   null,
    
    errorMessage:     null,
    ongoingAction:    false,
    
    resetError: function() {
      this.set('errorMessage', null);
    },
    
    startAction: function() {
      this.set('ongoingAction', true);
    },
    endAction: function() {
      this.set('ongoingAction', false);
    },
    
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
          var action = AWE.Action.Fundamental.createLeaveAllianceAction(this.get('allianceId'));
          if (!action) {
            this.set('errorMessage', 'Client Error: Could not leave alliance.');
          }
          else {
            self.startAction();
            AWE.Action.Manager.queueAction(action, function(statusCode) {
              if (statusCode !== 200) {
                this.set('errorMessage', 'Could not leave alliance.');
              }
              self.endAction();
            });       
          }     
          this.destroy();  
        },
      });      
      this.resetError();
      WACKADOO.presentModalDialog(dialog);
    },
  
    joinAlliance: function() {
      var self     = this;
      var tag      = this.get('allianceTag');
      var password = this.get('alliancePassword')
      
      this.resetError();
      
      if (!tag || tag.length < 2) {
        this.set('errorMessage', 'Enter a valid alliance tag.');
        return ;
      }
      if (!password) {
        this.set('errorMessage', 'Enter the secret password of the alliance.');
        return ;
      }
      
      var action = AWE.Action.Fundamental.createJoinAllianceAction(tag, password);
      this.startAction();
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode === 404) {
          self.set('errorMessage', 'There is no alliance with the tag you entered.');
        }
        else if (statusCode === 403) {
          self.set('errorMessage', 'Alliance tag and password do not match.');
        }
        else if (statusCode !== 200) {
          self.set('errorMessage', 'For some reason, joining the alliance did fail.')
        }
        self.endAction();
      });       
    },
    
    createAlliance: function () {
      var self     = this;
      var tag      = this.get('newAllianceTag');
      var name     = this.get('newAllianceName');
      
      this.resetError();
      
      if (!tag || tag.length < 2 || tag.length > 5) {
        this.set('errorMessage', 'Enter a valid alliance tag with 2 to 5 characters.');
        return ;
      }
      if (!name || name.length < 2) {
        this.set('errorMessage', 'Enther a valid alliance name of at least 2 characters.');
        return ;
      }
      
      var action = AWE.Action.Fundamental.createCreateAllianceAction(tag, name);
      this.startAction();
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode === AWE.Net.CONFLICT) {
          self.set('errorMessage', "The tag you've chosen is already taken by another alliance.");
        }
        else if (statusCode === AWE.Net.FORBIDDEN) {
          self.set('errorMessage', "You're not allowed to create an alliance.");
        }
        else if (statusCode !== AWE.Net.CREATED) {
          self.set('errorMessage', 'For some reason, creating the alliance did fail.')
        }
        self.endAction();
      });          
    }
    
  });  
  
  
  return module;
    
}(AWE.UI.Ember || {}));




