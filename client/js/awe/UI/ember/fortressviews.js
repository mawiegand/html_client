/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = window.AWE || {};
AWE.UI  = AWE.UI     || {}; 

AWE.UI.Ember = (function(module) {
  
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/fortressscreen.html');
  
  /**
   * View for displaying a Settlement of type "fortress". This is only partially
   * dynamic. It is closely connected to the actuall definitions in the 
   * rules_buildings.xml and must change, in case the number of type of slots
   * changes there.
   *
   * @class
   * @name AWE.UI.Ember.FortressView 
   */
	module.FortressView = Ember.View.extend( /** @lend AWE.UI.FortressView */ {
		leftTower: null,
		rightTower: null,
		wall: null,
		
	  /** reference to the home-base (instance of {@link AWE.GS.Settlement} to
	   * display. May be null. */
		fortress: null,
		/** references the slot that is presently selected in the view. */
		selectedSlot: null,
    /** reference to all building-slots of the base. May be null or empty. */
    slotsBinding: 'hashableSlots.collection',
    /** true in case there are representations of the slots available. */
    haveSlotsBinding: Ember.Binding.bool('slots'),
	
    hashableSlots: function () {
      var settlementId = this.getPath('fortress.id');
      return settlementId ? AWE.GS.SlotAccess.getHashableCollectionForSettlement_id(settlementId) : null;
    }.property('fortress.id').cacheable(),
    
    wall: function() {
      var slots = this.get('slots');
      return slots && slots.length > 0 ? slots[0] : null;
    }.property('hashableSlots.changedAt').cacheable(),
		
    leftTower: function() {
      var slots = this.get('slots');
      return slots && slots.length > 0 ? slots[1] : null;
    }.property('hashableSlots.changedAt').cacheable(),		
		
    rightTower: function() {
      var slots = this.get('slots');
      return slots && slots.length > 0 ? slots[2] : null;
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
		  return this.getPath('fortress.hashableQueues');
		}.property('fortress', 'fortress.hashableQueues.changedAt').cacheable(),
		
		trainingQueues: function() {
		  console.log('TRAINING QUEUES', this.getPath('fortress.hashableTrainingQueues'));
		  return this.getPath('fortress.hashableTrainingQueues');
		}.property('fortress', 'fortress.hashableTrainingQueues', 'fortress.hashableTrainingQueues.changedAt').cacheable(),
		
	});

  module.ToolTipView = Ember.View.extend({
  
    mouseX: 0,
    mouseY: 0,
  
    updatePosition: function() {
      var parent = this.get('parentView');
      var posX = this.get('mouseX') + 10; // - parent.$().offset().left + 10;
      var posY = this.get('mouseY') + 18; // - parent.$().offset().top + 18;
    
      if (posY > 460) {
        posY = this.get('mouseY')- 200;
        posX += 48;
      }
        
      this.$().css({'left': posX, 'top': posY});    
    }.observes('mouseX', 'mouseY'),
  
    didInsertElement: function() {
      console.log('did insert tooltip', this);
      this.$().remove();
      this.$().appendTo('.fortress-picture');
      this.updatePosition();
    },
    
    willDestroyElement: function() {
      console.log('destroy tooltip', this);
      this.$().remove();
    }
  
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




