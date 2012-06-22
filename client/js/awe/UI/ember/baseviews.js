/**
 * @fileOverview 
 * Ember.JS views for the home-base screen.
 *
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany.
 * Do not copy, do not distribute. All rights reserved.
 *
 * @author <a href="mailto:sascha@5dlab.com">Sascha Lange</a>
 * @author <a href="mailto:patrick@5dlab.com">Patrick Fox</a>
 */ 

var AWE = window.AWE || {};
AWE.UI = AWE.UI || {}; 

/** @namespace */
AWE.UI.Ember = (function(module) /** @lend AWE.UI.Ember */ {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/settlementviews.html');
  module.templates.push('js/awe/UI/ember/templates/basescreen.html');
  
  /**
   * View for displaying a Settlement of type "base". This is only partially
   * dynamic. It is closely connected to the actuall definitions in the 
   * rules_buildings.xml and must change, in case the number of type of slots
   * changes there.
   *
   * @class
   * @name AWE.UI.Ember.BaseView 
   */
	module.BaseView = Ember.View.extend( /** @lends AWE.UI.Ember.BaseView# */ {
	  /** reference to the home-base (instance of {@link AWE.GS.Settlement} to
	   * display. May be null. */
		base:         null,
		/** references the slot that is presently selected in the view. */
		selectedSlot: null,
    /** reference to all building-slots of the base. May be null or empty. */
    slotsBinding:     'hashableSlots.collection',
    /** true in case there are representations of the slots available. */
    haveSlotsBinding: Ember.Binding.bool('slots'),

    hashableSlots: function () {
      var settlementId = this.getPath('base.id');
      return settlementId ? AWE.GS.SlotAccess.getHashableCollectionForSettlement_id(settlementId) : null;
    }.property('base.id').cacheable(),
    
    wallSlot: function() {
      var slots = this.get('slots');
      return slots && slots.length > 0 ? slots[0] : null;
    }.property('hashableSlots.changedAt').cacheable(),
		
    largeSlots: function() {
      var slots = this.get('slots');
      return slots && slots.length > 0 ? slots.slice(1,5) : null; // TODO: let the controller set this from the AWE.Config settings
    }.property('hashableSlots.changedAt').cacheable(),		
		
    smallSlots: function() {
      var slots = this.get('slots');
      return slots && slots.length > 0 ? slots.slice(5,slots.length) : null;
    }.property('hashableSlots.changedAt').cacheable(),		
				
		queues: function() {
		  return this.getPath('base.hashableQueues');
		}.property('base', 'base.hashableQueues.changedAt').cacheable(),
		
		trainingQueues: function() {
		  return this.getPath('base.hashableTrainingQueues');
		}.property('base', 'base.hashableTrainingQueues.changedAt').cacheable(),
		
	});
    
  return module;
    
}(AWE.UI.Ember || {}));

