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
      console.log ('SORTING SLOTS')
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
    
    classNameBindings: ['expanded'],
    
    settlement: null,
    expanded: false,
    
    lastError: null, 
    
//    defenseBonusBinding: Ember.Binding.notNull("settlement.defense_bonus", "0"),
            
    click: function() {
      if (this.get('expanded') === false) {
        this.set('expanded', true);
      }
      else {
        this.set('expanded', false);
      }
    },       
    
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
      var self = this;
      
      this.set('lastError', null);
      
      var changeDialog = AWE.UI.Ember.TextInputDialog.create({
        classNames: ['change-army-name-dialog'],
        
        heading:    'Gib den neuen Steuersatz ein (5-15%).',
        input:      this.getPath('settlement.taxPercentage'),
        settlement: this.get('settlement'),
        
        okPressed:  function() {
          var number = parseInt(this.get('input') || "0");
          console.log('OK_PRESSED', self,this, this.get('input'), number)
          if (number >= 5 && number <= 15) {
            var action = AWE.Action.Settlement.createChangeTaxRateAction(self.get('settlement'), number/100.0);
            AWE.Action.Manager.queueAction(action, function(statusCode) {
              if (statusCode === 200 || statusCode === 203) {
                console.log('changed tax rate');
              }
              else {
                self.set('lastError', 'settlement.error.serverDidNotAcceptTaxRate');
              }
            });  
          }
          else {
            self.set('lastError', 'settlement.error.couldNotChangeTaxRate');
          }
          this.destroy();            
        },
        cancelPressed: function() { this.destroy(); }
      });
      WACKADOO.presentModalDialog(changeDialog);
      event.preventDefault();
      
      return false;
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
    
    
  });
  
  
  return module;
    
}(AWE.UI.Ember || {}));