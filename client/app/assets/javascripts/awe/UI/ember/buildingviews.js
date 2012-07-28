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

AWE.UI.Ember = (function(module) {
  
  module.presentToolTipOnView = null;
  

  /** @class
   * @name AWE.UI.Ember.BuildingView */  
  module.BuildingView = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingView# */ {
    building:     null,
    
		levelBinding: 'building.level',
		typeBinding:  'building.type',

    classNameBindings: ['size1:size1', 'size2:size2', 'size3:size3',  'size4:size4',  'size5:size5',  'size6:size6', 'type', 'slotLayoutId'],

    size1: function() {
      var level = this.get('level');
      if (level == 0) {  // special case: return small also for level 0, iff there is a building (building id set, so it's under construction)
        if (this.getPath('type')) {
          return true ; 
        }
      }
      else {
        return level > 0 && level < 4;
      }
    }.property('level', 'type').cacheable(),
  
    size2: function() {
      return this.get('level') >= 4 && this.get('level') < 8;
    }.property('level').cacheable(),
      
    size3: function() {
      return this.get('level') >= 8 && this.get('level') < 11;
    }.property('level').cacheable(),
    
    size4: function() {
      return this.get('level') >= 11 && this.get('level') < 14;
    }.property('level').cacheable(),

    size5: function() {
      return this.get('level') >= 14 && this.get('level') < 18;
    }.property('level').cacheable(),  
  
    size6: function() {
      return this.get('level') >= 18;
    }.property('level').cacheable(),


  });

  /** @class
   * @name AWE.UI.Ember.BuildingSlotView */  
  module.BuildingSlotView = module.BuildingView.extend( /** @lends AWE.UI.Ember.BuildingSlotView# */ {
    templateName: 'interactive-building-slot',
    mouseX: 0,
    mouseY: 0,
    timeout: 100,    // tooltip timeout in ms
		settlement: null,
		slot:       null,
		
		buildingBinding: 'slot.building',
				
		mouseInView: false,
  
    showTooltip: function() {
      if (this.get('mouseInView') === true) {  // only show tooltip, if the mouse is still in view
        this.setPath('parentView.hoveredBuildingSlotView', this);
      }
    },
  
    mouseEnter: function(event) {
      var self = this;
      this.set('mouseInView', true);  // need to set this because showTooltip is called delayed and there we need to check, whether the mouse left the view during the meantime
      setTimeout(function() {
        self.showTooltip();
      }, this.get('timeout'));
    },
    mouseMove: function(event) {
      this.set('mouseX', event.pageX);
      this.set('mouseY', event.pageY);
    },
    mouseLeave: function(event) {
      this.set('mouseInView', false);
      this.setPath('parentView.hoveredBuildingSlotView', null);
    },
    
  
    click: function(event) {
		  var slot = this.get('slot');
		  var controller = this.getPath('parentView.controller');
		  
		  if (controller) {
		    controller.slotClicked(slot);
		  }
		  else {
		    console.log('In Interactive Building View: no controller found!');
		  }
		},  
		
    slotLayoutId: function() {
      var slotNum = this.getPath('slot.slot_num');
      return slotNum ? "slot"+slotNum : null;
    }.property('slot.slot_num').cacheable(),
    
    buildingCategories: function() {
      var buildingId  = this.getPath('slot.buildingId');
      var slot        = this.get('slot');
      return (buildingId === null || buildingId === undefined) && slot ? slot.buildingCategories() : null;
    }.property('slot.buildingId', 'slot.settlement_id', 'slot.slot_num'),	
    
    buildingCategoryNames: function() {
      var categories = this.get('buildingCategories');
      if (!categories || categories.length == 0) {
        return ""
      }
      categories = categories.map(function(category) {
        return '<span class="green-color">'+AWE.Util.Rules.lookupTranslation(category.name)+'</span>';
      });
      return categories;
    }.property('buildingCategories'),
    
    maxLevel: function() {
      var slot = this.get('slot');
      return slot ? slot.slotType().max_level : null;
    }.property('slot.slot_num', 'slot.settlement_id' ),
		
  });
  

  /** @class
   * @name AWE.UI.Ember.HoverableView */  
  module.HoverableView = Ember.View.extend( /** @lends AWE.UI.Ember.HoverableView# */ {
    hovered:     false,
    		  
    mouseEnter: function(event) {
      var self = this;
      this.set('hovered', true);
      this.setPath('parentView.hoveredView', this);
    },
    mouseLeave: function(event) {
      this.set('hovered', false);
      this.setPath('parentView.hoveredView', null);
    },
  });

  return module;
    
}(AWE.UI.Ember || {}));




