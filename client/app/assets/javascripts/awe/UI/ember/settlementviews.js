/**
 * @fileOverview 
 * Ember JS views for the settlement screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {
  
  /**
   * Abstract view  class for displaying a Settlement of any type. Provides
   * the infrastructure that is in common among all settlement types. Specific
   * settlement tpyes (e.g. fortress, base, outpost) then need to derive
   * their own view class from this abstract class by augmenting it with a
   * type-specific slot-assignment and other methods.
   *
   * @class
   * @name AWE.UI.Ember.SettlementView 
   */
	module.SettlementView = Ember.View.extend( /** @lends AWE.UI.Ember.SettlementView# */ {
	  /** reference to the home-base (instance of {@link AWE.GS.Settlement} to
	   * display. May be null. */
		settlement: null,
		/** references the slot that is presently selected in the view. */
		selectedSlot: null,
    /** reference to all building-slots of the base. May be null or empty. */
    slots: function() {
      var collection = this.getPath('hashableSlots.collection');
      log ('SORTING SLOTS')
      return collection ? collection.sort(function(a,b) {
        return a.get('slot_num') - b.get('slot_num');
      }) : null;
    }.property('hashableSlots.changedAt').cacheable(),

    /** true in case there are representations of the slots available. */
    haveSlotsBinding: Ember.Binding.bool('slots'),
    
    hoveredBuildingSlotView: null,

    hashableSlots: function () {
      var settlementId = this.getPath('settlement.id');
      return settlementId ? AWE.GS.SlotAccess.getHashableCollectionForSettlement_id(settlementId) : null;
    }.property('settlement.id').cacheable(),
    				
		queues: function() {
		  return this.getPath('settlement.hashableQueues');
		}.property('settlement', 'settlement.hashableQueues.changedAt').cacheable(),
		
		trainingQueues: function() {
		  return this.getPath('settlement.hashableTrainingQueues');
		}.property('settlement', 'settlement.hashableTrainingQueues.changedAt').cacheable(),
		
    shouldDisplaySettlementSwitch: function() {
      var settlement = this.get('settlement');
      return settlement && settlement !== AWE.GS.SettlementManager.getPreviousSettlementOfCharacter(settlement);
    }.property('settlement.owner_id'),
    
    infoClicked: function() {
      var dialog = AWE.UI.Ember.SettlementInfoBoxDialog.create({
        settlement: this.get('settlement'),
      });
      WACKADOO.presentModalDialog(dialog);
    },

    unselectSlot: function(){ 
      WACKADOO.presentScreenController.unselectSlot();
    },

  });

  /** 
   * View that displays some general information about the settlement. 
   *
   * @class
   * @name AWE.UI.Ember.SettlementInfoBox  */  
  module.SettlementInfoBoxView = Ember.View.extend( /** @lends AWE.UI.Ember.SettlementInfoBox */ {
    templateName: "settlement-info-box",
    
    hashableConstructionQueuesBinding: "settlement.hashableQueues",
    hashableTrainingQueuesBinding: "settlement.hashableTrainingQueues",
        
    settlement: null,
    
//    defenseBonusBinding: Ember.Binding.notNull("settlement.defense_bonus", "0"),
            
    click: function() {
      var dialog = AWE.UI.Ember.SettlementInfoBoxDialog.create({
        settlement: this.get('settlement'),
      });
      WACKADOO.presentModalDialog(dialog);
    },
    
    defenseBonus: function() {
      return (this.getPath('settlement.defense_bonus') || 0) * 100;
    }.property('settlement.defense_bonus'),
            
    buildingQueue: function() {
      var queues = this.getPath('hashableConstructionQueues.collection');
      return this.findQueueOfType(queues, 'queue_buildings');
    }.property('hashableConstructionQueues.changedAt').cacheable(),
    
    buildingSpeed: function() {
      var speed = this.getPath('buildingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('buildingQueue.speed').cacheable(),
    
		
    infantryTrainingQueue: function() {
      var queues = this.getPath('hashableTrainingQueues.collection');
      return this.findQueueOfType(queues, 'queue_infantry');
    }.property('hashableTrainingQueues.changedAt').cacheable(),
    
    infantryTrainingSpeed: function() {
      var speed = this.getPath('infantryTrainingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('infantryTrainingQueue.speed').cacheable(),   


    cavalryTrainingQueue: function() {
      var queues = this.getPath('hashableTrainingQueues.collection');
      return this.findQueueOfType(queues, 'queue_cavalry');
    }.property('hashableTrainingQueues.changedAt').cacheable(),
    
    cavalryTrainingSpeed: function() {
      var speed = this.getPath('cavalryTrainingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('cavalryTrainingQueue.speed').cacheable(),   
    
    
    artilleryTrainingQueue: function() {
      var queues = this.getPath('hashableTrainingQueues.collection');
      return this.findQueueOfType(queues, 'queue_artillery');
    }.property('hashableTrainingQueues.changedAt').cacheable(),
    
    artilleryTrainingSpeed: function() {
      var speed = this.getPath('artilleryTrainingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('artilleryTrainingQueue.speed').cacheable(),  
    
    
    siegeTrainingQueue: function() {
      var queues = this.getPath('hashableTrainingQueues.collection');
      return this.findQueueOfType(queues, 'queue_siege');
    }.property('hashableTrainingQueues.changedAt').cacheable(),
    
    siegeTrainingSpeed: function() {
      var speed = this.getPath('siegeTrainingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('siegeTrainingQueue.speed').cacheable(),  
    
    findQueueOfType: function(queues, symtype) {
      queues = queues ? queues.filter(function(item) {
        return item.getPath('queueType.symbolic_id') === symtype; 
      }) : null;
      return queues && queues.length === 1 ? queues[0] : null ;
    },
  });
	
  module.SettlementInfoBoxDialog = module.PopUpDialog.extend({
    templateName: 'settlement-info-box-dialog',
		
    hashableConstructionQueuesBinding: "settlement.hashableQueues",
    hashableTrainingQueuesBinding: "settlement.hashableTrainingQueues",
        
    settlement: null,
    
    lastError: null, 
    
    changingName: false,

    settingsDialog: function() {
      this.set('message', null);
      var changeDialog = AWE.UI.Ember.TextInputDialog.create({
        classNames: ['change-army-name-dialog'],
        heading: AWE.I18n.lookupTranslation('settlement.customization.changeNameDialogCaption'),
        input: this.getPath('settlement.name'),
        inputMaxLength: 16,
        controller: this,

        okPressed: function() {
          var controller = this.get('controller');
          if (controller) {
            controller.processNewName(this.getPath('input'));
          }
          this.destroy();
        },

        cancelPressed: function() { this.destroy(); },
      });
      WACKADOO.presentModalDialog(changeDialog);
      event.preventDefault();

      return false;
    },
    
    nameChangeCosts: function() {
      return this.getPath('settlement.type').change_name_cost.amount;
    }.property('settlement').cacheable(),
    
    nameChangeResource: function() {
      var resourceId = this.getPath('settlement.type').change_name_cost.resource_id;
      return AWE.GS.RulesManager.getRules().getResourceType(resourceId).symbolic_id;
    }.property('settlement').cacheable(),
    
    firstNameChange: function() { 
      var count = this.getPath('settlement.name_change_count');
      return count === undefined || count === null || count < this.getPath('settlement.type').change_name_cost.free_changes;
    }.property('settlement.name_change_count'),

    isOutOrFortress: function() {
      return (this.settlement.isOutpost || this.settlement.isFortress);
    },

    changeNamePressed: function(event) {
      this.set('message', null);
      var changeDialog = AWE.UI.Ember.TextInputDialog.create({
        classNames: ['change-army-name-dialog'],
        heading: AWE.I18n.lookupTranslation('settlement.customization.changeNameDialogCaption'),
        input: this.getPath('settlement.name'),
        inputMaxLength: 16,
        controller: this,
        
        okPressed: function() {
          var controller = this.get('controller');
          if (controller) {
            controller.processNewName(this.getPath('input'));
          }
          this.destroy();            
        },
        
        cancelPressed: function() { this.destroy(); },
      });
      WACKADOO.presentModalDialog(changeDialog);
      event.preventDefault();
      
      return false;
    },
    
    processNewName: function(newName) {
      
      if (!newName || newName.length < 3) {
        this.set('message', AWE.I18n.lookupTranslation('settlement.customization.errors.nameTooShort'));
      }
      else if (!newName || newName.length > 16) {
        this.set('message', AWE.I18n.lookupTranslation('settlement.customization.errors.nameTooLong'));
      }
      else if (newName === this.getPath('settlement.name')) {
        this.set('message', AWE.I18n.lookupTranslation('settlement.customization.errors.nameNoChange'));
      }      
      else {  // now, really send the name
        var self = this;
        var changeCounter = this.getPath('settlement.name_change_count');
        this.set('changingName', true);
        var action = AWE.Action.Settlement.createChangeSettlementNameAction(self.get('settlement'), newName);
        AWE.Action.Manager.queueAction(action, function(status) {
          self.set('changingName', false);
          if (status === AWE.Net.OK) {
            if (changeCounter > 0) {
              AWE.GS.ResourcePoolManager.updateResourcePool();
            }
          }
          else if (status === AWE.Net.CONFLICT) {
            self.set('message', AWE.I18n.lookupTranslation('settlement.customization.errors.nameTaken'))
          }
          else if (status === AWE.Net.FORBIDDEN) {
            self.set('message', AWE.I18n.lookupTranslation('settlement.customization.errors.changeNameCost'))
          }
          else {
            self.set('message', AWE.I18n.lookupTranslation('settlement.customization.errors.changeNameError'));
          }
        });        
      }
    },
    
//    defenseBonusBinding: Ember.Binding.notNull("settlement.defense_bonus", "0"),
    
    defenseBonus: function() {
      return (this.getPath('settlement.defense_bonus') || 0) * 100;
    }.property('settlement.defense_bonus'),
    
    /** true, in case the tax rate can be changed again. Problem: does not update 
     * automatically when the 8 hours have passed! */
    changeTaxPossible: function() {
      var lastChange = this.getPath('settlement.tax_changed_at');
      return lastChange === undefined || lastChange === null || Date.parseISODate(lastChange).add(1).hours().getTime() < new Date().getTime();
    }.property('settlement.tax_changed_at'),

    changeTaxPressed: function(event) {
      if (!this.get('changeTaxPossible')) {
          this.showErrorTax(AWE.I18n.lookupTranslation('settlement.info.taxRateChangeNotPossible'));
        return;
      }

      var self = this;
      
      this.set('lastError', null);
      
      var changeDialog = module.PopUpDialog.create({
        templateName: 'tax-change-new-dialog',

        settlement: this.get('settlement'),
        valueText: this.getPath('settlement.taxPercentage'),

        okTaxPressed:  function() {
          var number = parseInt(this.get('valueText') || "0");
          log('OK_PRESSED', self,this, this.get('valueText'), number)
          if (number >= 5 && number <= 15) {
            var action = AWE.Action.Settlement.createChangeTaxRateAction(self.get('settlement'), number/100.0);
            AWE.Action.Manager.queueAction(action, function(statusCode) {
              if (statusCode === 200 || statusCode === 203) {
                log('changed tax rate');
              }
              else {
                self.showErrorTax(AWE.I18n.lookupTranslation('settlement.error.serverDidNotAcceptTaxRate'));
              }
            });  
          }
          else {
            self.showErrorTax(AWE.I18n.lookupTranslation('settlement.error.couldNotChangeTaxRate'));
          }
          this.destroy();            
        },

        isFortress: function(){
          var number = parseInt(this.getPath('settlement.type.id'));
          return number === 1;
        }.property('settlement.type.id').cacheable(),
      });
      /*AWE.UI.Ember.TextInputDialog.create({
        classNames: ['change-army-name-dialog'],
        
        heading:    AWE.I18n.lookupTranslation('settlement.info.setTaxRate'),
        input:      this.getPath('settlement.taxPercentage'),
        settlement: this.get('settlement'),
        
        okPressed:  function() {
          var number = parseInt(this.get('input') || "0");
          log('OK_PRESSED', self,this, this.get('input'), number)
          if (number >= 5 && number <= 15) {
            var action = AWE.Action.Settlement.createChangeTaxRateAction(self.get('settlement'), number/100.0);
            AWE.Action.Manager.queueAction(action, function(statusCode) {
              if (statusCode === 200 || statusCode === 203) {
                log('changed tax rate');
              }
              else {
                self.showErrorTax(AWE.I18n.lookupTranslation('settlement.error.serverDidNotAcceptTaxRate'));
              }
            });  
          }
          else {
            self.showErrorTax(AWE.I18n.lookupTranslation('settlement.error.couldNotChangeTaxRate'));
          }
          this.destroy();            
        },
        cancelPressed: function() { this.destroy(); }
      });*/
      WACKADOO.presentModalDialog(changeDialog);
      event.preventDefault();
      
      return false;
    },
    
    movePressed: function() {
      var moveDialog = AWE.UI.Ember.MovingView.create({
        character: AWE.GS.CharacterManager.getCharacter(this.getPath('settlement.owner_id'))
      });
      WACKADOO.presentModalDialog(moveDialog);
    },
    
    regionMovingPassword: function() {
      var region = this.getPath('settlement.region');
      if (region) {
        return region.movingPassword();
      }
      return "";
    }.property('settlement.region'),

    showErrorTax: function(message) {
      errorDialog = AWE.UI.Ember.InfoDialog.create({
        heading: AWE.I18n.lookupTranslation('settlement.error.couldNotChangeTaxRateHead'),
        message: message
      });
      WACKADOO.presentModalDialog(errorDialog);
    },
    
    invitationLinkPressed: function() {
      
      var mailWindow = window.open('mailto:?' +
        encodeURI('subject=' + AWE.I18n.lookupTranslation('settlement.invitationLink.mailSubject') +'&') + 
        encodeURI('body=' + AWE.I18n.lookupTranslation('settlement.invitationLink.mailBody') + AWE.Config.PLAYER_INVITATION_BASE + this.getPath('settlement.regionInvitationCode')));
      mailWindow.close();
      
      event.preventDefault();
      return false;
    },
	
    abandonOutpostPressed: function() {
      var self = this;
      var abandonDialog = AWE.UI.Ember.SettlementAbandonDialog.create({
        okPressed:  function() {
          abandonDialog.set('loading', true);
          var action = AWE.Action.Settlement.createAbandonOutpostAction(self.get('settlement'));
          AWE.Action.Manager.queueAction(action, function(statusCode) {
            if (statusCode === 200 || statusCode === 203) {
              abandonDialog.destroy();
              WACKADOO.modalDialogClosed();
              WACKADOO.activateMapController();
            }
            else {
              abandonDialog.set('error', true);
            }
          });  
        },
		
        cancelPressed: function() {
          this.destroy();
          WACKADOO.modalDialogClosed();
        }
      });
      WACKADOO.presentModalDialog(abandonDialog);
    },

   invationPressed: function() {
      var self = this;
      var invationDialog = AWE.UI.Ember.SettlementInvationDialog.create({
        settlement: this.get('settlement'),

       linkPressed: function() {
          var mailWindow = window.open('mailto:?' +
          encodeURI('subject=' + AWE.I18n.lookupTranslation('settlement.invitationLink.mailSubject') +'&') +
          encodeURI('body=' + AWE.I18n.lookupTranslation('settlement.invitationLink.mailBody') + AWE.Config.PLAYER_INVITATION_BASE + this.getPath('settlement.regionInvitationCode')));
          mailWindow.close();

          event.preventDefault();
          return false;
        },

        okPressed: function() {
          this.destroy();
          WACKADOO.modalDialogClosed();
        }
      });
      WACKADOO.presentModalDialog(invationDialog);
    },
            
    buildingQueue: function() {
      var queues = this.getPath('hashableConstructionQueues.collection');
      return this.findQueueOfType(queues, 'queue_buildings');
    }.property('hashableConstructionQueues.changedAt').cacheable(),
    
    buildingSpeed: function() {
      var speed = this.getPath('buildingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('buildingQueue.speed').cacheable(),
    
    infantryTrainingQueue: function() {
      var queues = this.getPath('hashableTrainingQueues.collection');
      return this.findQueueOfType(queues, 'queue_infantry');
    }.property('hashableTrainingQueues.changedAt').cacheable(),
    
    infantryTrainingSpeed: function() {
      var speed = this.getPath('infantryTrainingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('infantryTrainingQueue.speed').cacheable(),   


    cavalryTrainingQueue: function() {
      var queues = this.getPath('hashableTrainingQueues.collection');
      return this.findQueueOfType(queues, 'queue_cavalry');
    }.property('hashableTrainingQueues.changedAt').cacheable(),
    
    cavalryTrainingSpeed: function() {
      var speed = this.getPath('cavalryTrainingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('cavalryTrainingQueue.speed').cacheable(),   
    
    
    artilleryTrainingQueue: function() {
      var queues = this.getPath('hashableTrainingQueues.collection');
      return this.findQueueOfType(queues, 'queue_artillery');
    }.property('hashableTrainingQueues.changedAt').cacheable(),
    
    artilleryTrainingSpeed: function() {
      var speed = this.getPath('artilleryTrainingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('artilleryTrainingQueue.speed').cacheable(),  
    
    
    siegeTrainingQueue: function() {
      var queues = this.getPath('hashableTrainingQueues.collection');
      return this.findQueueOfType(queues, 'queue_siege');
    }.property('hashableTrainingQueues.changedAt').cacheable(),
    
    siegeTrainingSpeed: function() {
      var speed = this.getPath('siegeTrainingQueue.speed');
      return speed ? speed * 100 : 0;
    }.property('siegeTrainingQueue.speed').cacheable(),  
    
        
    
    findQueueOfType: function(queues, symtype) {
      queues = queues ? queues.filter(function(item) {
        return item.getPath('queueType.symbolic_id') === symtype; 
      }) : null;
      return queues && queues.length === 1 ? queues[0] : null ;
    },
    
    okPressed: function() {
      this.destroy();
      return false;
    },
	});

  module.TaxesRangeView  = Ember.TextField.extend({
    classNames: ["taxes-range-slider"],
    attributeBindings: ["min", "max"],
    type: "range",
    min: 5,
    max: 15,
    settlement: null,

    onValueChanged: function(){
      var number = parseInt(this.get('value') || "0");
      this.setPath('parentView.valueText', number);
      return true;
    }.observes('value'),
  });
  
  module.SettlementAbandonDialog = Ember.View.extend({
    templateName: "settlement-abandon-dialog",
    
    loading: null,
    error: null,
  });

  module.SettlementInvationDialog = Ember.View.extend({
    templateName: "settlement-invation-dialog",

    settlement: null
  });
  
  return module;
    
}(AWE.UI.Ember || {}));