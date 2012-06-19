/* Authors: Sascha Lange <sascha@5dlab.com>, 
 *          Patrick Fox <patrick@5dlab.com>
 * Copyright (C) 2012 5D Lab GmbH, Freiburg, Germany
 * Do not copy, do not distribute. All rights reserved.
 */

var AWE = AWE || {};
AWE.UI = AWE.UI || {}; 

AWE.UI.Ember = (function(module) {
  
  module.presentToolTipOnView = null;
  
  module.templates = module.templates || [];
  module.templates.push('js/awe/UI/ember/templates/fortressscreen.html');
  

  module.SelectBuildingDialog = Ember.View.extend({
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
  
  
  module.FortressInfoBoxView = Ember.View.extend({
    templateName: "fortress-info-box",
    
    nameBinding: "fortress.name",
    defenseBonusBinding: "fortress.defense_bonus",
    
    init: function(spec) {
      this._super(spec);
      console.log('FORTRESS', this.get('fortress'), this.get('parentView'), this.get('parentView').get('fortress'), this);
    },
    
    hashableConstructionQueues: function() {
      var id = this.get('fortress') ? this.get('fortress').get('id') : null;
      if (id) {
        return AWE.GS.ConstructionQueueAccess.getHashableCollectionForSettlement_id(id);
      }
      else {
        return null;
      }
    }.property('fortress.id').cacheable(),
    
    buildingQueue: function() {
      var queues = this.get('hashableConstructionQueues');
      if (!queues) {
        return null;
      }
      var filtered = queues.get('collection').filter(function(item) {
        return item.get('queueType') ? item.get('queueType').symbolic_id === "queue_buildings" : false; 
      });
      if (filtered.length === 1) {
        return filtered[0];
      }
      else {
        return null;
      }
    }.property('hashableConstructionQueues.changedAt').cacheable(),
    
    buildingSpeed: function() {
      var speed = this.get('buildingQueue') ? this.get('buildingQueue').get('speed') : null;
      console.log('SPEED', speed);
      return speed;
    }.property('buildingQueue.speed').cacheable(),
    
    
  });
  
  module.BuildingDetailsDialog = Ember.View.extend({
    templateName: "settlement-dialog-building-details",
  
    cancelPressed: function() {
      this.get('controller').unselectSlot();
    },
                      
    upgradeClicked: function(event) {
      this.get('controller').constructionUpgradeClicked(this.get('slot'));
    },         
    
  }); 

	module.FortressView = Ember.View.extend({
		fortress:  null,  ///< pointer to the settlement model
		haveSlots: false,
		leftTower: null,
		rightTower: null,
		wall: null,
		
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
			    console.log(slot, slot.get('slot_num'), slot.get('building_id'));
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


  module.BuildingView = Ember.View.extend({
    model: null, 

		levelBinding: 'model.level',
		typeBinding: 'model.type',

    classNameBindings: ['small:size1', 'middle:size2', 'large:size3', 'type'],

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
    }.property('level', 'model.building'),
  
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
  
  module.TrainableUnitButtonView = Ember.View.extend({
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
  
  module.TrainingQueueView = Ember.View.extend({
    templateName: "training-queue-view",
    
    selectedUnitType: null,
    number: "1",

    queue: null,

		costs: function() {
		  var unitType = this.get('selectedUnitType');
		  return unitType && unitType.costs ? AWE.Util.Rules.lookupResourceCosts(unitType.costs) : null;
		}.property('selectedUnitType').cacheable(),
		
		totalCosts: function() {
		  return AWE.Util.Rules.multipliedResourceCosts(this.get('costs'), this.get('number') || 0.0);
		}.property('costs', 'number').cacheable(),
		
		productionTime: function() {
		  var unitType = this.get('selectedUnitType');
		  var speed    = this.getPath('queue.speed') || 1.0;
		  console.log('SPEED', this.getPath('queue.speed'));
		  return unitType ? AWE.Util.Rules.calculateProductionTime(unitType.production_time, speed) : null;
		}.property('queue.speed', 'selectedUnitType').cacheable(),   ///< TODO : also update, when queue's speedup changes.

		totalProductionTime: function() {
		  var productionTime  = this.get('productionTime');
		  var number          = this.get('number')
		  return productionTime && number > 0 ? productionTime * number : null;
		}.property('productionTime', 'number').cacheable(),  

    trainableUnitTypes: function() {
      var queueType = this.getPath('queue.queueType');
      var rules     = AWE.GS.RulesManager.getRules();
      if (!queueType || !queueType.produces) {
        return null;
      }
      return AWE.GS.RulesManager.getRules().getUnitTypesWithCategories(queueType.produces);
    }.property('queue.queueType').cacheable(),

    createJobPressed: function(evt) {
      this.get('controller').trainingCreateClicked(this.get('queue'), this.getPath('selectedUnitType.id'), this.get('number'));
    },
    
  });
  
  module.TrainingJobView = Ember.View.extend({
    classNameBindings: ['active'],
    
    job: null,
    
    cancelJobPressed: function(evt) {
      this.get('controller').trainingCancelClicked(this.get('job'));
    },
    
    active: function() {
      return this.get('job').active_job !== null;
    }.property('job.active_job'),    
  });

  module.ConstructionQueueView = Ember.View.extend({
    templateName: 'construction-queue-view',
    queues: null,
  });

  module.ConstructionJobView = Ember.View.extend({
    classNameBindings: ['active'],
    
    job: null,
    
    cancelJobPressed: function(event) {
      this.get('controller').constructionCancelClicked(this.get('job'));
    },
    
    active: function() {
      return this.get('job').active_job !== null;
    }.property('job.active_job'),    
  });

  return module;
    
}(AWE.UI.Ember || {}));




