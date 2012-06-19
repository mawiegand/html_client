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

var AWE = AWE || {};
AWE.UI = AWE.UI || {}; 

/** @namespace */
AWE.UI.Ember = (function(module) /** @lend AWE.UI.Ember */ {
  

  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/basescreen.html');
  
  /** 
   * @class
   * @name AWE.UI.Ember.BaseView 
   */
	module.BaseView = Ember.View.extend( /** @lends AWE.UI.Ember.BaseView# */ {
		base:       null,  ///< pointer to the settlement model
		haveSlots:  false,
		leftTower:  null,
		rightTower: null,
		wall:       null,
		
		selectedSlot: null,
		
		setSlots: function(slots) {
		  var self = this;
			if (slots && AWE.Util.hashCount(slots) > 0) {
			  AWE.Ext.applyFunctionToHash(slots, function(slot_id, slot) {
			    
			    switch (slot.get('slot_num')) {
			    case 0: self.set('wall', slot); break;
			    case 1: self.set('leftTower', slot); break;
			    case 2: self.set('rightTower', slot); break;
			    default: console.log('ERROR: unkown slot in fortress with number: ' + slot.get('slot_num') );
			    }
			  });
				this.set('haveSlots', true);
			}
			else {
				this.set('haveSlots', false);
			}
		},
		
		queues: function() {
		  return this.getPath('fortress.hashableQueues');
		}.property('fortress', 'fortress.hashableQueues.changedAt').cacheable(),
		
		trainingQueues: function() {
		  return this.getPath('fortress.hashableTrainingQueues');
		}.property('fortress', 'fortress.hashableTrainingQueues', 'fortress.hashableTrainingQueues.changedAt').cacheable(),
		
	});
  
  
  return module;
    
}(AWE.UI.Ember || {}));