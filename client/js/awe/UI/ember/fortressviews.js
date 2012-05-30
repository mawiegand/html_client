/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {};

AWE.UI.Ember = (function(module) {
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/fortressscreen.html');
  

	module.FortressView = Ember.View.extend({
		fortress: null,  ///< pointer to the settlement model
		haveSlots: false,
		leftTower: null,
		rightTower: null,
		wall: null,
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
			    console.log(slot, slot.get('slot_num'), slot_id, slot.get('building_id'));
			  });
				this.set('haveSlots', true);
			}
			else {
				this.set('haveSlots', false);
			}
		},
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
      this.$().remove();
      this.$().appendTo('.fortress-picture');
      this.updatePosition();
    },
  
  });


  module.BuildingView = Ember.View.extend({
    model: null, 
    hovered: false,

		levelBinding: 'model.building.level',
		typeBinding: 'model.building.type',

    classNameBindings: ['small:size1', 'middle:size2', 'large:size3', 'hovered', 'type'],

    small: function() {
      return this.get('level') > 0 && this.get('level') < 4;
    }.property('level'),
  
    middle: function() {
      return this.get('level') >= 4 && this.get('level') < 8;
    }.property('level'),
  
    large: function() {
      return this.get('level') >= 8;
    }.property('level'),
    
  });

  module.InteractiveBuildingView = module.BuildingView.extend({
    templateName: 'interactive-building',
    tooltip: false,
    mouseX: 0,
    mouseY: 0,
    timeout: 0,    // tooltip timeout in ms
		settlement: null,
  
    showTooltip: function() {
      this.set('tooltip', true);
    },
  
    mouseEnter: function(event) {
      var self = this;
      this.set('hovered', true);
      setTimeout(function() {
        if (self.get('hovered')) {
          self.showTooltip();
        }
      }, this.get('timeout'));
    },
    mouseMove: function(event) {
      this.set('mouseX', event.pageX);
      this.set('mouseY', event.pageY);
    },
    mouseLeave: function(event) {
      this.set('hovered', false);
      this.set('tooltip', false);
      $().unbind('mousemove');
    },
    
  
    click: function(event) {
      console.log('click on interactive building');
		  var model = this.get('model');
		  var controller = this.get('parentView') ? this.get('parentView').get('controller') : null;
		  
		  if (controller) {
		    controller.slotClicked(model);
		  }
		  else {
		    console.log('no controller found!');
		  }
		},  
  });
  
  return module;
    
}(AWE.UI.Ember || {}));




