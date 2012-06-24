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
   * @extends AWE.UI.Ember.SettlementView
   * @name AWE.UI.Ember.FortressView 
   */
	module.FortressView = AWE.UI.Ember.SettlementView.extend( /** @lends AWE.UI.FortressView# */ {
    templateName : "fortress-screen",
			    
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
      console.log('RIGHT TOWER', slots)
      return slots && slots.length > 0 ? slots[2] : null;
    }.property('hashableSlots.changedAt').cacheable(),		
				
	});

  
  return module;
    
}(AWE.UI.Ember || {}));




