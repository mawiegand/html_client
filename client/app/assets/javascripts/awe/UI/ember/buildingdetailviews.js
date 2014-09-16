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
  
  /** @class
   * @name AWE.UI.Ember.SelectBuildingDialog */
  module.SelectBuildingDialog = Ember.View.extend( /** @lends AWE.UI.Ember.SelectBuildingDialog# */ {
    templateName: "settlement-dialog-select-building",
    heading: AWE.I18n.lookupTranslation('settlement.buildings.select.heading'),
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    optionClicked: function(event) {
      var slot = this.get('slot');
      var building = event.view.getPath('building');
      var type = event.view.getPath('building.type');
      this.get('controller').constructionOptionClicked(slot, building, type, event.view);
    }, 

    resourceExchangePressed: function() {
      var dialog = AWE.UI.Ember.ResourceExchangeDialog.create();
      WACKADOO.presentModalDialog(dialog);
      return false;
    },
    
    constructionOptions: function() {
      var slot = this.get('slot');
      var options = slot ? slot.constructionOptions() : [];
      log ('OPTIONS', options);
      var result = options.filter(function(building) {
        log('BUILDING', building);
        return !building.impossibleToBuildDueToMissingDivineSupporterStatus() && !building.impossibleToBuildDueToMaxRequirement();
      });
      return result && result.length > 0 ? result : null;
    }.property('slot.building_id', 'slot.settlement'),  
  });  

  /** @class
   * @name AWE.UI.Ember.BuildingOptionView */
  module.BuildingOptionView = module.HoverableView.extend( /** @lends AWE.UI.Ember.BuildingOptionView# */ {
    classNameBindings: ['requirementUnmet'],

    building: null,

    unmetRequirementGroups: function() {
      var building = this.get('building');
      return building ? building.unmetRequirementGroups() : null;
    }.property('building.buildingType', 'building.slot.settlement.hashableSlots.collection@each.level', 'building.slot.settlement.hashableSlots.changedAt'),    

    requirementsMet: function() {
      var unmetRequirementGroups = this.get('unmetRequirementGroups');
      return !unmetRequirementGroups || unmetRequirementGroups.length === 0;
    }.property('unmetRequirementGroups', 'unmetRequirementGroups.length'), 
    
    requirementUnmet: function() {
      return !this.get('requirementsMet');
    }.property('requirementsMet'),

    uiMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      if (tutorialState.isUIMarkerActive(AWE.GS.MARK_BUILDING_OPTION)) {
        return tutorialState.buildingTypeOfMarkerTest() == this.getPath('building.buildingId');
      }
      else {
        return false;
      }
    }.property('building').cacheable(),
  });
  
  
  module.BuildingOptionDetailView = Ember.View.extend({
    templateName:      "building-option-details",
    classNames: ['building-option-details'],
    classNameBindings:  "same",
    
    building: null,
    hovered: null,
   
    unmetRequirementGroups: function() {
      var building = this.get('building');
      return building ? building.unmetRequirementGroups() : null;
    }.property('building.buildingType', 'building.slot.settlement.hashableSlots.collection@each.level', 'building.slot.settlement.hashableSlots.changedAt'),    

    requirementsMet: function() {
      var unmetRequirements = this.get('unmetRequirementGroups');
      return !unmetRequirements || unmetRequirements.length === 0;
    }.property('unmetRequirementGroups', 'unmetRequirementGroups.length'), 
    
    requirementUnmet: function() {
      return !this.get('requirementsMet');
    }.property('requirementsMet'),   
   
    same: function() {
      return this.getPath('building.buildingId') === this.getPath('hovered.buildingId');
    }.property('building', 'hovered').cacheable(),
  });
   
  module.GeneralResourceView = Ember.View.extend({
    tagName:      'span', 
    experience:   null,
    resources:    null,
  });
  
  module.ResourceProductionView = module.GeneralResourceView.extend({
    templateName: 'building-production-view',
  });
  
  module.ResourceCostView = module.GeneralResourceView.extend({
    templateName: 'building-cost-view',
  });
 
  /** @class
   * @name AWE.UI.Ember.BuildingDetailsDialog */  
  module.BuildingDetailsDialog = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingDetailsDialog# */ {
    templateName: "settlement-dialog-building-details",
  
    sendingUpgradeBinding: 'controller.status.sendingUpgrade',
    sendingDestroyBinding: 'controller.status.sendingDestroy',
    sendingConvertBinding: 'controller.status.sendingConvert',
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    upgradeClicked: function(event) {
      this.get('controller').constructionUpgradeClicked(this.get('slot'));
    },         
    
    destroyClicked: function(event) {
      this.get('controller').constructionDestroyClicked(this.get('slot'));
    },         
    
    conversionClicked: function(event) {
      this.get('controller').constructionConvertClicked(this.get('slot'));
    },
    
    destroyClasses: function() {
      return this.getPath('slot.building_id') && (this.getPath('slot.hashableJobs.collection').length == 0 ? 'destroy' : 'destroy disabled');
    }.property('slot.hashableJobs.changedAt').cacheable(),

    resourceExchangePressed: function() {
      var dialog = AWE.UI.Ember.ResourceExchangeDialog.create();
      WACKADOO.presentModalDialog(dialog);
      return false;
    },

    upgradeUIMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return this.getPath('building.slot.uiMarker') && tutorialState.isUIMarkerActive(AWE.GS.MARK_UPGRADE_BUTTON) && tutorialState.buildingTypeOfMarkerTest() == this.getPath('building.buildingId');
    }.property('building.slot.uiMarker'),
  });
  
  
  /** @class
   * @name AWE.UI.Ember.TrainableUnitButtonView */  
  module.TrainableUnitButtonView = Ember.View.extend( /** @lends AWE.UI.Ember.TrainableUnitButtonView# */ {
    templateName: "trainable-unit-button",
      
    classNameBindings: ['selected', 'requirementUnmet'],  
    
      
    click: function(event) {
      this.get('parentView').set('selectedUnitButton', this);
    },     
    
    selected: function() {
      return this === this.getPath('parentView.selectedUnitButton');
    }.property('parentView.selectedUnitButton').cacheable(),
    

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

    unitSelectionButtonUIMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return this.get('requirementsMet') && tutorialState.isUIMarkerActive(AWE.GS.MARK_TRAINING_DIALOG_FLOW) && this.getPath('parentView.selectedUnitButton') == null;
    }.property('parentView.selectedUnitButton').cacheable(),
  });
  
  module.ArrayItemView = Ember.View.extend({
    array: null,
    item:  null,
    
    /** dirty hack to determine the last item in the groups array */
    isLastItem: function() {
      return this.getPath('array.lastObject') == this.get('item');
    }.property('array.lastObject', 'item').cacheable(),
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

    maxLevelZero: function() {
      return this.getPath('requirement.max_level') !== undefined && this.getPath('requirement.max_level') === 0;
    }.property('requirement.max_level').cacheable(),
  });
  
  /** @class
   * @name AWE.UI.Ember.DiplomacyView */  
  module.DiplomacyView = Ember.View.extend( /** @lends AWE.UI.Ember.DiplomacyView# */ {
    templateName: "diplomacy-view",
    
    characterBinding: 'AWE.GS.game.currentCharacter',
    
    allianceTag:      null,   // input bindings
    alliancePassword: null,
    
    newAllianceName:  null,
    newAllianceTag:   null,
    
    errorMessage:     null,
    ongoingAction:    false,

    redeemReservation: false,

    formHeader: function() {
      if (this.get('redeemReservation')) {
        return AWE.I18n.lookupTranslation('alliance.redeemAllianceReservationHeader');
      }
      else {
        return AWE.I18n.lookupTranslation('alliance.joinAllianceHeader');
      }
    }.property('redeemReservation').cacheable(),

    formDescription: function() {
      if (this.get('redeemReservation')) {
        return AWE.I18n.lookupTranslation('alliance.redeemAllianceReservationText');
      }
      else {
        return AWE.I18n.lookupTranslation('alliance.joinAllianceText');
      }
    }.property('redeemReservation').cacheable(),

    formButton: function() {
      if (this.get('redeemReservation')) {
        return AWE.I18n.lookupTranslation('alliance.redeemAllianceReservationButton');
      }
      else {
        return AWE.I18n.lookupTranslation('alliance.joinAllianceButton');
      }
    }.property('redeemReservation').cacheable(),

    formSwitchHeader: function() {
      if (this.get('redeemReservation')) {
        return AWE.I18n.lookupTranslation('alliance.joinAllianceHeader');
      }
      else {
        return AWE.I18n.lookupTranslation('alliance.redeemAllianceReservationHeader');
      }
    }.property('redeemReservation').cacheable(),


    formSwitchButton: function() {
      if (this.get('redeemReservation')) {
        return AWE.I18n.lookupTranslation('alliance.joinAllianceButton');
      }
      else {
        return AWE.I18n.lookupTranslation('alliance.redeemAllianceReservationButton');
      }
    }.property('redeemReservation').cacheable(),

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
      var message = AWE.I18n.lookupTranslation('alliance.confirmLeave.message');
      var hours = this.getPath("character.hoursUntilAllianceRejoinAllowed");      
      if(hours !== 0){
        var string = AWE.I18n.lookupTranslation('alliance.confirmLeave.message2');
        message += string.format(hours);
      }

      var dialog = AWE.UI.Ember.InfoDialog.create({
        heading:    AWE.I18n.lookupTranslation('alliance.confirmLeave.heading'),
        message:    message,
        allianceId: this.getPath('character.alliance_id'),
        
        cancelPressed: function() {
          this.destroy();
        },
        okText: AWE.I18n.lookupTranslation('general.yes'),
        cancelText: AWE.I18n.lookupTranslation('general.cancel'),
        okPressed: function(event) {
          var action = AWE.Action.Fundamental.createLeaveAllianceAction(this.get('allianceId'));
          if (!action) {
            this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.leaveFailedClient'));
          }
          else {
            self.startAction();
            AWE.Action.Manager.queueAction(action, function(statusCode) {
              if (statusCode !== 200) {
                this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.leaveFailed'));
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

    joinAllianceNotAllowedText: function(){
      var string = AWE.I18n.lookupTranslation('alliance.joinAllianceNotAllowedText');
      return string.format(AWE.Util.localizedDateTime(this.getPath("character.cannot_join_alliance_until"))).toLocaleString());
    }.property("character.cannot_join_alliance_until"),
  
    joinAlliance: function() {
      var self     = this;
      var tag      = this.get('allianceTag');
      var password = this.get('alliancePassword')
      
      this.resetError();
      
      if (!tag || tag.length < 2) {
        this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.invalidTag'));
        return ;
      }
      if (!password) {
        this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.invalidPassword'));
        return ;
      }
      
      var action = AWE.Action.Fundamental.createJoinAllianceAction(tag, password);
      this.startAction();
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode === 404) {
          self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.tagNotTaken'));
        }
        else if (statusCode === 403) {
          self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.wrongPassword'));
        }
        else if (statusCode === AWE.Net.CONFLICT) {
          self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.memberLimitReached'));
        }
        else if (statusCode !== 200) {
          self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.unknownJoin'));
        }
        self.endAction();
      });       
    },
    
    createAlliance: function () {
      var self     = this;
      var tag      = this.get('newAllianceTag');
      var name     = this.get('newAllianceName');
      
      this.resetError();
      
      if (!tag || tag.length < 2 || tag.length > 5 || tag.match(/[^A-Za-z0-9]/)) {
        this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.enterValidTag'));
        return ;
      }
      if (!name || name.length < 2) {
        this.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.enterValidName'));
        return ;
      }
      
      var action = AWE.Action.Fundamental.createCreateAllianceAction(tag, name);
      this.startAction();
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if (statusCode === AWE.Net.CONFLICT) {
          self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.tagTaken'));
        }
        else if (statusCode === AWE.Net.FORBIDDEN) {
          self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.noPermissionCreate'));
        }
        else if (statusCode !== AWE.Net.CREATED) {
          self.set('errorMessage', AWE.I18n.lookupTranslation('alliance.error.unknownCreate'))
        }
        self.endAction();
      });          
    },

    joinRandomAlliancePressed: function () {
      var self = this;
      var characterId = AWE.GS.game.getPath('currentCharacter.id');
      
      var action = AWE.Action.Fundamental.createAutoJoinAllianceAction(characterId);
      this.startAction();
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        //TODO: check for different error codes
        if(statusCode !== 200) {
          errorDialog = AWE.UI.Ember.InfoDialog.create({
            heading: AWE.I18n.lookupTranslation('alliance.joinRandomAllianceFailedHead'),
            message: AWE.I18n.lookupTranslation('alliance.joinRandomAllianceFailedText'),
          }); 
          WACKADOO.presentModalDialog(errorDialog);
        }
        self.endAction();
      });          
    },
    switchForm: function() {
      this.set('redeemReservation', !this.get('redeemReservation'));
    },
    
  });  
  
  
  return module;
    
}(AWE.UI.Ember || {}));




