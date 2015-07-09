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
   * @name AWE.UI.Ember.BuildingAnnotationView */
  module.BuildingAnnotationView = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingAnnotationView# */ {
    templateName: "settlement-building-annotation",    
    
    classNameBindings: ['slotAnnotationPosition'],
    
    sendingUpgradeBinding: 'controller.status.sendingUpgrade',
    sendingDestroyBinding: 'controller.status.sendingDestroy',
    sendingConvertBinding: 'controller.status.sendingConvert',
    
    slotAnnotationPosition: function() {
      var slotNum = this.getPath('slot.slot_num');
      if(slotNum !== undefined)
      {
        return "slot" + slotNum;
      }
      return null;
    }.property('slot.slot_num').cacheable(),

    isMilitary: function() {
      return this.get('building').isMilitaryBuilding();
    }.property('building.level').cacheable(),
    
    infoClicked: function(event) {
      var slot = this.get('slot');
      this.get('controller').constructionInfoClicked(this.get('slot'));
    },

    isEmpty: function()
    {
      return (this.getPath('building.hashableJobs.collection').length === 0);
    }.property('building.hashableJobs.collection.length').cacheable(),
    
    upgradeClicked: function(event) {
      var dialog;
      if(AWE.Config.BuildingSettings.newUpgradeForBuilding(this.getPath('slot.building.buildingType.symbolic_id')))
      {
        var dialog = AWE.UI.Ember.UpgradeUnlockDialog.create({
          slot: this.get('slot'),
          controller: this.get('controller')
        });
      }
      else 
      {
        var dialog = AWE.UI.Ember.UpgradeView.create({
          slot: this.get('slot'),
          controller: this.get('controller')
        });
      }
      WACKADOO.presentModalDialog(dialog);
      //this.get('controller').constructionUpgradeClicked(this.get('slot'));
    },         
    
    destroyClicked: function(event) {
      this.get('controller').constructionDestroyClicked(this.get('slot'));
    },
    
    conversionClicked: function(event) {
      var dialog = AWE.UI.Ember.UpgradeView.create({
        slot: this.get('slot'),
        controller: this.get('controller'),
        conversionView: true,
      });
      WACKADOO.presentModalDialog(dialog);
      //this.get('controller').constructionConvertClicked(this.get('slot'));
    },
    
    assignmentClicked: function(event) {
      var dialog = AWE.UI.Ember.AssignmentsDialog.create({
        controller: this.get('controller'),
        building: this.get('building'),
      });
      WACKADOO.presentModalDialog(dialog);
      //this.get('controller').constructionAssignmentClicked(this.get('slot'));
    },
    
    diplomacyClicked: function(event) {
      var dialog = AWE.UI.Ember.AllianceDiplomacyDialog.create({
        unlockedAllianceCreation: this.getPath('building.unlockedAllianceCreation')
      });
      WACKADOO.presentModalDialog(dialog);
      //this.get('controller').constructionDiplomacyClicked(this.get('slot'));
    },
    
    tradeClicked: function() {
      var dialog = AWE.UI.Ember.TradeNewView.create({
          settlement: this.getPath('building.slot.settlement'),
          controller: this.get("controller")});
      WACKADOO.presentModalDialog(dialog);
    },
    
    artifactClicked: function(event) {
      //this.get('controller').constructionArtifactClicked(this.get('slot'));
      var dialog = AWE.UI.Ember.ArtifactInitiationDialog.create({
        controller: WACKADOO.presentScreenController,
        settlement: AWE.GS.SettlementManager.getSettlement(WACKADOO.presentScreenController.settlementId),
      });
      WACKADOO.presentModalDialog(dialog);
    },
    
    militaryClicked: function(event) {
      var building = this.getPath("slot.building");
      var startTab = 0;
      var subTab = 0;
      building.get("unlockedQueues").forEach(function(queue){
        if(queue.category === 'queue_category_training')
        {
          startTab = 1;

          if(queue.symbolic_id === "queue_infantry")
          {
            subTab = 0;
          }
          if(queue.symbolic_id === "queue_artillery")
          {
            subTab = 1;
          }
          if(queue.symbolic_id === "queue_cavalry")
          {
            subTab = 2;
          }
          if(queue.symbolic_id === "queue_special")
          {
            subTab = 3;
          }
        }
      });
      var dialog = AWE.UI.Ember.MilitaryInfoDialogNew.create({
        //garrisonArmy: AWE.GS.SettlementManager.getSettlement(WACKADOO.presentScreenController.settlementId).get('garrison'),
        controller: WACKADOO.presentScreenController,
        settlement: AWE.GS.SettlementManager.getSettlement(WACKADOO.presentScreenController.settlementId),
        startTab: startTab,
        subTab: subTab
      });
      dialog.set('garrisonArmy', AWE.GS.SettlementManager.getSettlement(WACKADOO.presentScreenController.settlementId).get('garrison')),
      WACKADOO.presentModalDialog(dialog);
      //this.get('controller').constructionMilitaryClicked(this.get('slot'));
    },
    
    constructionCoinsClicked: function(event) {
      this.get('controller').constructionCoinsClicked(this.get('slot'));
    },
    
    constructionCancelClicked: function(event) {
      this.get('controller').constructionCancelClicked(this.get('slot'));
    },      

    upgradeUIMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return this.getPath('building.slot.uiHUDMarker') && tutorialState.isUIMarkerActive(AWE.GS.MARK_UPGRADE_BUTTON) && tutorialState.buildingTypeOfMarkerTest() == this.getPath('building.buildingId');
    }.property('building.slot.uiHUDMarker'),

    militaryUIMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return this.getPath('building.slot.uiHUDMarker') && tutorialState.isUIMarkerActive(AWE.GS.MARK_UNITS_BUTTON);
    }.property('building.slot.uiHUDMarker'),
    
    assignmentUIMarker: function() {
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      return this.getPath('building.slot.uiHUDMarker') && tutorialState.isUIMarkerActive(AWE.GS.MARK_FIRST_STANDARD_ASSIGNMENT);
    }.property('building.slot.uiHUDMarker'),

  });  

module.BuildingSelectionDialog = module.PopUpDialog.extend({
    templateName: 'building-selection',

    open: function(){
      WACKADOO.presentModalDialog(this);
    },

    closeDialog: function() {
      this.get('controller').unselectSlot();
      this.destroy();
    },

    isInTutorial: function(){
      var tutorialState = AWE.GS.TutorialStateManager.getTutorialState();
      if(tutorialState.isUIMarkerActive(AWE.GS.MARK_BUILDING_OPTION)){
        return true;
      }
      return false;
    }.property('AWE.GS.TutorialLocalState.lastUpdate').cacheable(),
  });

module.SelectBuildingNewView = Ember.View.extend({
    templateName: "settlement-new-view-select-building",

    heading: AWE.I18n.lookupTranslation('settlement.buildings.select.heading'),
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    optionClicked: function(event) {
      var slot = this.get('slot');
      var building = event.view.getPath('building');
      var type = event.view.getPath('building.type');

      if (!building.requirementsMet())
      {
        if (event.view && typeof event.view.onInfoClicked !== "undefined")
        {
          event.view.onInfoClicked();
        }
        
        return ; // do nothing, ignore click on greyed-out building.
      }

      this.get('controller').constructionOptionClicked(slot, building, type, event.view);
      this.getPath('parentView').destroy();
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

  module.BuildingOptionDetailNewView = module.BuildingOptionDetailView.extend({
    templateName:      "building-option-details-new-view",
    classNames: ['building-option-details-new-view'],

    building: null,

    onInfoClicked: function()
    {
      var dialog = AWE.UI.Ember.BuildingOptionDetailNewDialog.create({building: this.get('building'), level: 1});
      WACKADOO.presentModalDialog(dialog);
    },

    isConstructionPossible: function()
    {
      var requirements = this.get("building").requirementsMet();
      return requirements
    }.property("building"),

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

  module.BuildingOptionDetailNewDialog = module.PopUpDialog.extend({
    templateName:      "building-option-details-new-dialog",
    classNames: ['building-option-details-new-dialog'],
    
  });

   module.BuildingOptionDetailNewDialogView = module.BuildingOptionDetailView.extend({
    templateName:      "building-option-details-new-dialog-view",
    classNames: ['building-option-details-new-dialog-view'],

    buildingImageLevel: function() {
      var imageLevel = AWE.Config.BuildingImageLibrary.getImageLevelForBuilding(this.getPath("building.buildingType.symbolic_id"), this.get("level"));
      return "size" + imageLevel;
    }.property("building", "level"),

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
      return string.format(AWE.Util.localizedDateTime(this.getPath("character.cannot_join_alliance_until")));
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




