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

  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/settlementviews.html');
  
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
    
    defenseBonusBinding: Ember.Binding.notNull("settlement.defense_bonus", "0"),
            
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