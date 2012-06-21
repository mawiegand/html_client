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

AWE.UI.Ember = (function(module) {
  
  module.presentToolTipOnView = null;
  
  module.templates = module.templates || [];
//  module.templates.push('js/awe/UI/ember/templates/buildingviews.html');
  

  /** @class
   * @name AWE.UI.Ember.SelectBuildingDialog */
  module.SelectBuildingDialog = Ember.View.extend( /** @lends AWE.UI.Ember.SelectBuildingDialog# */ {
    templateName: "settlement-dialog-select-building",
    heading: 'Select Building',
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    optionClicked: function(event) {
      var slot = this.get('slot');
      var buildingId = event.view.get('content').get('buildingId');
      var type = event.view.get('content').get('type');
      this.get('controller').constructionOptionClicked(slot, buildingId, type);
      this.get('controller').unselectSlot();
    },         
  });  
  
 
  /** @class
   * @name AWE.UI.Ember.BuildingDetailsDialog */  
  module.BuildingDetailsDialog = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingDetailsDialog# */ {
    templateName: "settlement-dialog-building-details",
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    upgradeClicked: function(event) {
      this.get('controller').constructionUpgradeClicked(this.get('slot'));
    },         
    
  }); 



  /** @class
   * @name AWE.UI.Ember.BuildingView */  
  module.BuildingView = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingView# */ {
    model: null, 

		levelBinding: 'model.level',
		typeBinding: 'model.building.type',

    classNameBindings: ['small:size1', 'middle:size2', 'large:size3', 'type', 'slotLayoutId'],

    small: function() {
      var level = this.get('level');
      if (level == 0) {  // special case: return small also for level 0, iff there is a building (building id set, so it's under construction)
        if (this.getPath('model.building')) {
          return true ; 
        }
      }
      else {
        return level > 0 && level < 4;
      }
    }.property('level', 'model.building').cacheable(),
  
    middle: function() {
      return this.get('level') >= 4 && this.get('level') < 8;
    }.property('level').cacheable(),
  
    large: function() {
      return this.get('level') >= 8;
    }.property('level').cacheable(),
    
    slotLayoutId: function() {
      var slotNum = this.getPath('model.slot_num');
      return slotNum ? "slot"+slotNum : null;
    }.property('model.slot_num').cacheable(),
  });

  /** @class
   * @extends  AWE.UI.Ember.BuildingView
   * @name AWE.UI.Ember.InteractiveBuildingView */  
  module.InteractiveBuildingView = module.BuildingView.extend( /** @lends AWE.UI.Ember.InteractiveBuildingView# */ {
    templateName: 'interactive-building',
    tooltip: false,
    mouseX: 0,
    mouseY: 0,
    timeout: 0,    // tooltip timeout in ms
		settlement: null,
		
		mouseInView: false,
		
  
    showTooltip: function() {
      if (this.get('mouseInView') === true) {  // only show tooltip, if the mouse is still in view
        this.set('tooltip', true);
      }
    },
  
    mouseEnter: function(event) {
      var self = this;
      this.set('mouseInView', true);  // need to set this because showTooltip is called delayed and there we need to check, whether the mouse left the view during the meantime
      setTimeout(function() {
        self.showTooltip();
      }, this.get('timeout'));
      console.log('mouse entered', this);
    },
    mouseMove: function(event) {
      this.set('mouseX', event.pageX);
      this.set('mouseY', event.pageY);
    },
    mouseLeave: function(event) {
      this.set('mouseInView', false);
      this.set('tooltip', false);
      //$().unbind('mousemove');
      console.log('mouse left', this);
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
  
  
  /** @class
   * @name AWE.UI.Ember.TrainableUnitButtonView */  
  module.TrainableUnitButtonView = Ember.View.extend( /** @lends AWE.UI.Ember.TrainableUnitButtonView# */ {
    templateName: "trainable-unit-button",
      
    classNameBindings: ['selected'],  
    
      
    click: function(event) {
      this.get('parentView').set('selectedUnitType', this.get('unitType'));
    },     
    
    selected: function() {
      return this.get('unitType') === this.getPath('parentView.selectedUnitType');
    }.property('parentView.selectedUnitType').cacheable(),
    
    
    // TODO: check requirements and costs. should become a mixin somehow
  
    requirementsMet: function() {
      return true ;
    }.property('queue.settlement', 'unitType').cacheable(),
    
    costsMet: function() {
      return true ;
    }.property('queue.settlement', 'unitType').cacheable(),
    
    
  });

  return module;
    
}(AWE.UI.Ember || {}));




