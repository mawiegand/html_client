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

  module.animateBubbles = function(slotId) {
    var bubble = $('.bubble' + slotId)[0];
    if (jQuery.contains(document.documentElement, bubble)) {
      $(bubble).animate({top: "+=15px"}, 1500, function() {
        if (jQuery.contains(document.documentElement, bubble)) {
          $(bubble).animate({top: "-=15px"}, 1500, function() {
            AWE.UI.Ember.animateBubbles(slotId)
          });
        }
      });
    }
  };

  module.reanimateBubbles = function(slotId) {
    var bubble = $('.bubble' + slotId);
    if (jQuery.contains(document.documentElement, bubble[0]) && !bubble.is(':animated')) {
      module.animateBubbles(slotId);
    }
  };

  /** @class
   * @name AWE.UI.Ember.BuildingView */  
  module.BuildingView = Ember.View.extend( /** @lends AWE.UI.Ember.BuildingView# */ {
    building:     null,
    
		levelBinding: 'building.level',
		typeBinding:  'building.type',

    classNameBindings: ['size1:size1', 'size2:size2', 'size3:size3',  'size4:size4',  'size5:size5',  'size6:size6', 'type', 'slotLayoutId', 'levelClassName'],

    levelClassName: function() {
      return "level"+this.get('level');
    }.property('level').cacheable(),

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
      if (this.getPath('settlement.isFortress')) {
        return this.get('level') >= 8 && this.get('level') < 16;
      }
      else {
        return this.get('level') >= 8 && this.get('level') < 11;
      }
    }.property('level').cacheable(),
    
    size4: function() {
      if (this.getPath('settlement.isFortress')) {
        return this.get('level') >= 16 && this.get('level') < 17;
      }
      else {
        return this.get('level') >= 11 && this.get('level') < 14;
      }
    }.property('level').cacheable(),

    size5: function() {
      if (this.getPath('settlement.isFortress')) {
        return this.get('level') >= 17 && this.get('level') < 18;
      }
      else {
        return this.get('level') >= 14 && this.get('level') < 18;
      }
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

    init: function() {
      this._super();
    },

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
		    log('In Interactive Building View: no controller found!');
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
   * @name AWE.UI.Ember.BubbleView */  
  module.BubbleView = Ember.View.extend({
    templateName: 'bubble',
    slot: null,

    bubbleAmountBinding: 'slot.bubble_amount',
    bubbleXPBinding: 'slot.bubble_xp',

    bubbleClass: function() {
      return 'bubble' + this.getPath('slot.id');
    }.property('slot').cacheable(),

    xp: function() {
      return this.getPath('slot.bubble_xp') && this.getPath('slot.bubble_xp') > 0;
    }.property('slot.bubble_xp').cacheable(),

    init: function() {
      this._super();
    },

    click: function(event) {
      var element = event.currentTarget;
      var bubbleCount = 4;
      var self = this;

      $(element).find('.bubble').stop(true);

      // append small bubbles
      for(var i = 1; i <= bubbleCount; ++i) {
        $(element).append('<div class="small-bubble n'+i+'">&nbsp;</div>');
        $(element).find('.small-bubble').css('top', $(element).find('.bubble').css('top'));
      }

      // remove big bubble background
      $(element).find('.bubble').css('background', 'none');

      $(element).find(".bubble-resource").animate({
        opacity: 0.2,
        top: ["-=40px", 'linear'],
      },  2000);

      $(element).find('.bubble-xp').css('visibility', 'visible');
      $(element).find('.bubble-amount').css('visibility', 'visible');

      // animate small bubbles
      for(var i = 1; i <= bubbleCount; ++i) {
        $(".small-bubble.n"+i).animate({
          opacity: 0.2,
          left: ["+="+Math.floor((Math.random()*160)-80), 'linear'],
          top: ["+="+Math.floor((Math.random()*160)-80), 'linear'],
        }, 1000, function() {
          if (!jQuery.contains(document.documentElement, $(element))) {
            $(element).hide();
          }
        });
      }

      var action = AWE.Action.Settlement.createRedeemSlotBubbleAction(this.getPath('slot.id'));
      AWE.Action.Manager.queueAction(action, function(statusCode) {
        if(statusCode == 200) {
          AWE.GS.ResourcePoolManager.updateResourcePool(null, function() {
          });
          AWE.GS.CharacterManager.updateCurrentCharacter();
          AWE.GS.SlotManager.updateSlotsAtSettlement(self.getPath('slot.settlement.id'), AWE.GS.ENTITY_UPDATE_TYPE_FULL, function(slots) {
//            log('----------> slots', slots);
            AWE.Ext.applyFunctionToElements(slots, function(slot) {
//              log('----------> slot', slot);
//              log('----------> slot res id', slot.get('bubble_resource_id'));
            });
          });
        }
      });

      return false;
    },  
    
    /**
     * returns true if bubble_resource_id is not null and thus
     * activates the bubble
     */
	  isActive: function() {
      return this.getPath('slot.bubble_resource_id') != null;
    }.property('slot', 'slot.bubble_resource_id').cacheable(),

    activeObserver: function() {
      if (this.getPath('slot.bubble_resource_id') != null) {
        AWE.UI.Ember.animateBubbles(this.getPath('slot.id'));
      }
    }.observes('slot.bubble_resource_id'),

    /**
     * returns the resource type for the bubble resource
     */
    resourceType: function() {
      return AWE.GS.RulesManager.getRules().getResourceType(this.getPath('slot.bubble_resource_id'));
    }.property('slot', 'slot.bubble_resource_id').cacheable(),
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




